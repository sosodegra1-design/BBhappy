/* End-to-end tests over the real HTTP surface: the admin write API, its
 * authentication, and the storefront routes that read the catalog (cart,
 * favorites, checkout). The shop is exercised through fetch() against a server
 * bound to an ephemeral port, so a regression in routing or in the async
 * catalog reads fails here rather than in production.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), 'bbvoltex-api-')), 'api.db')}`;
delete process.env.TURSO_AUTH_TOKEN;
delete process.env.STRIPE_SECRET_KEY;
const ADMIN_KEY = 'test-admin-key-0123456789';
process.env.ADMIN_API_KEY = ADMIN_KEY;

const { app } = require('../server/index');
const db = require('../server/db');
const { seedProductsIfEmpty } = require('../server/products-repo');
const { PRODUCTS } = require('../server/products-data');

let server;
let base;
let cookie = '';

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(base + path, { ...options, headers });
  const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  if (setCookies.length) cookie = setCookies.map(value => value.split(';')[0]).join('; ');
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

const auth = { 'X-Admin-Key': ADMIN_KEY };

const validProduct = (overrides = {}) => ({
  category: 'jouets',
  name: 'Robot test',
  name_en: 'Test robot',
  age: '6-8',
  ageLabel: '6-8 ans',
  ageLabel_en: '6-8 years',
  price: 39.9,
  iconKey: 'robot',
  ...overrides
});

before(async () => {
  await db.init();
  await seedProductsIfEmpty();
  server = app.listen(0);
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  await db.client.close();
});

/* ===================== STOREFRONT STILL WORKS ===================== */

test('the storefront API serves the whole catalog from the database', async () => {
  const { status, body } = await api('/api/products');
  assert.equal(status, 200);
  assert.equal(body.length, PRODUCTS.length);
  assert.deepStrictEqual(body, PRODUCTS, 'the browser must receive exactly what it received before');
});

test('health of the other public surfaces', async () => {
  assert.equal((await api('/api/cart')).status, 200);
  assert.equal((await api('/api/favorites')).status, 200);
  assert.equal((await api('/api/loyalty')).status, 200);
  assert.equal((await api('/api/products/p1')).status, 404, 'no per-product route exists, unchanged');
});

/* ===================== ADMIN AUTHENTICATION ===================== */

test('admin routes reject a missing key', async () => {
  const { status } = await api('/api/admin/products');
  assert.equal(status, 401);
});

test('admin routes reject a wrong key', async () => {
  const { status } = await api('/api/admin/products', { headers: { 'X-Admin-Key': 'wrong' } });
  assert.equal(status, 401);
});

test('admin routes accept the key, via header or bearer token', async () => {
  assert.equal((await api('/api/admin/products', { headers: auth })).status, 200);
  const bearer = await api('/api/admin/products', { headers: { Authorization: `Bearer ${ADMIN_KEY}` } });
  assert.equal(bearer.status, 200);
});

test('admin routes fail closed when ADMIN_API_KEY is not configured', async () => {
  // The dangerous default would be "no key configured means no check". Verify
  // that the opposite holds: a deploy missing the variable exposes nothing.
  const saved = process.env.ADMIN_API_KEY;
  delete process.env.ADMIN_API_KEY;
  try {
    const { status } = await api('/api/admin/products', { headers: auth });
    assert.equal(status, 503);
  } finally {
    process.env.ADMIN_API_KEY = saved;
  }
});

test('the taxonomy endpoint publishes the closed lists', async () => {
  const { status, body } = await api('/api/admin/taxonomy', { headers: auth });
  assert.equal(status, 200);
  assert.ok(body.categories.includes('jouets'));
  assert.ok(body.universes.includes('educatif'));
  assert.ok(body.iconKeys.includes('robot'));
});

/* ===================== ADMIN PRODUCT CRUD ===================== */

test('POST /api/admin/products publishes a product to the live catalog', async () => {
  const { status, body } = await api('/api/admin/products', {
    method: 'POST', headers: auth, body: JSON.stringify(validProduct())
  });
  assert.equal(status, 201);
  assert.equal(body.id, 'p13');
  assert.equal(body.icon.startsWith('<svg'), true);
  assert.equal(body.price, 39.9);

  const storefront = await api('/api/products');
  assert.equal(storefront.body.length, PRODUCTS.length + 1);
  assert.equal(storefront.body.at(-1).name, 'Robot test');
});

test('the admin API refuses a category outside the closed list', async () => {
  const { status, body } = await api('/api/admin/products', {
    method: 'POST', headers: auth, body: JSON.stringify(validProduct({ category: 'drones' }))
  });
  assert.equal(status, 400);
  assert.match(body.error, /Unknown category/);
});

test('PATCH /api/admin/products/:id updates one field', async () => {
  const { status, body } = await api('/api/admin/products/p13', {
    method: 'PATCH', headers: auth, body: JSON.stringify({ price: 44.9, sale: true, oldPrice: 49.9 })
  });
  assert.equal(status, 200);
  assert.equal(body.price, 44.9);
  assert.equal(body.sale, true);
  assert.equal(body.name, 'Robot test');

  const storefront = await api('/api/products');
  assert.equal(storefront.body.find(p => p.id === 'p13').price, 44.9);
  assert.equal((await api('/api/admin/products/missing', { method: 'PATCH', headers: auth, body: JSON.stringify({ price: 1 }) })).status, 404);
});

/* ===================== SUPPLIERS / DISTRIBUTORS ===================== */

test('suppliers and distributors can be added, listed and updated', async () => {
  const supplier = await api('/api/admin/suppliers', {
    method: 'POST', headers: auth, body: JSON.stringify({ name: 'Grossiste Bijoux Paris', marginCoefficient: 1.9 })
  });
  assert.equal(supplier.status, 201);
  assert.equal(supplier.body.kind, 'fournisseur');
  assert.equal(supplier.body.marginCoefficient, 1.9);
  assert.equal(supplier.body.status, 'actif');

  const distributor = await api('/api/admin/distributors', {
    method: 'POST', headers: auth, body: JSON.stringify({ name: 'Distri Sud', url: 'https://example.com' })
  });
  assert.equal(distributor.status, 201);
  assert.equal(distributor.body.kind, 'distributeur');

  const suppliers = await api('/api/admin/suppliers', { headers: auth });
  const distributors = await api('/api/admin/distributors', { headers: auth });
  assert.equal(suppliers.body.length, 1);
  assert.equal(distributors.body.length, 1, 'the two lists stay separate');

  const patched = await api(`/api/admin/suppliers/${supplier.body.id}`, {
    method: 'PATCH', headers: auth, body: JSON.stringify({ status: 'inactif', marginCoefficient: 2.2 })
  });
  assert.equal(patched.body.status, 'inactif');
  assert.equal(patched.body.marginCoefficient, 2.2);
});

test('deleting a supplier detaches its products instead of deleting them', async () => {
  const supplier = await api('/api/admin/suppliers', {
    method: 'POST', headers: auth, body: JSON.stringify({ name: 'Fournisseur éphémère' })
  });
  const product = await api('/api/admin/products', {
    method: 'POST', headers: auth, body: JSON.stringify(validProduct({
      name: 'Produit lié', sourceUrl: 'https://www.alibaba.com/product/999.html', supplierId: supplier.body.id
    }))
  });

  const before = await db.client.execute({ sql: 'SELECT supplier_id FROM products WHERE id = ?', args: [product.body.id] });
  assert.equal(Number(before.rows[0].supplier_id), supplier.body.id);

  assert.equal((await api(`/api/admin/suppliers/${supplier.body.id}`, { method: 'DELETE', headers: auth })).status, 200);

  const after = await db.client.execute({ sql: 'SELECT supplier_id FROM products WHERE id = ?', args: [product.body.id] });
  assert.equal(after.rows[0].supplier_id, null, 'the product survives, merely unlinked');
  const storefront = await api('/api/products');
  assert.ok(storefront.body.some(p => p.id === product.body.id), 'the detached product is still on sale');
});

/* ===================== CART / FAVORITES / ORDERS ===================== */

test('a published product can be put in the cart straight away', async () => {
  const { status, body } = await api('/api/cart/items', {
    method: 'POST', body: JSON.stringify({ productId: 'p13', color: '#ffffff', qty: 2 })
  });
  assert.equal(status, 201);
  const line = body.items.find(item => item.productId === 'p13');
  assert.equal(line.qty, 2);
  assert.equal(line.product.name, 'Robot test', 'the cart resolves the product from the database');
  assert.equal(body.total, 89.8);
});

test('the cart refuses an unknown product', async () => {
  const { status } = await api('/api/cart/items', {
    method: 'POST', body: JSON.stringify({ productId: 'ghost', color: '#ffffff', qty: 1 })
  });
  assert.equal(status, 400);
});

test('favorites ignore ids that no longer exist', async () => {
  const created = await api('/api/admin/products', {
    method: 'POST', headers: auth, body: JSON.stringify(validProduct({ name: 'Produit éphémère' }))
  });
  const gone = created.body.id;

  await api('/api/favorites/p1', { method: 'POST' });
  await api(`/api/favorites/${gone}`, { method: 'POST' });
  const both = await api('/api/favorites');
  assert.ok(both.body.productIds.includes(gone));

  await api(`/api/admin/products/${gone}`, { method: 'DELETE', headers: auth });
  const { body } = await api('/api/favorites');
  assert.ok(!body.productIds.includes(gone), 'the deleted product is filtered out');
  assert.ok(body.productIds.includes('p1'));
});

test('an order snapshots the product name so deleting it cannot erase history', async () => {
  // Start from an empty cart so the order is unambiguous.
  await api('/api/cart', { method: 'DELETE' });
  const created = await api('/api/admin/products', {
    method: 'POST', headers: auth, body: JSON.stringify(validProduct({ name: 'Produit historique', price: 25 }))
  });
  const id = created.body.id;

  await api('/api/cart/items', {
    method: 'POST', body: JSON.stringify({ productId: id, color: '#ffffff', qty: 1 })
  });
  const checkout = await api('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ name: 'Client Test', email: 'client@example.com', address: '1 rue', zip: '75001', city: 'Paris' })
  });
  assert.equal(checkout.status, 201);
  assert.equal(checkout.body.items[0].name, 'Produit historique');

  const rows = await db.client.execute({
    sql: 'SELECT name FROM order_items WHERE order_id = ?',
    args: [checkout.body.orderNumber]
  });
  assert.equal(rows.rows[0].name, 'Produit historique', 'the name is written on the order line, not looked up later');

  // The product is gone, but the recorded line still carries its name — this is
  // what keeps past orders and the tracking page readable after a deletion.
  await api(`/api/admin/products/${id}`, { method: 'DELETE', headers: auth });
  const after = await db.client.execute({
    sql: 'SELECT name FROM order_items WHERE order_id = ?',
    args: [checkout.body.orderNumber]
  });
  assert.equal(after.rows[0].name, 'Produit historique', 'history survives the deletion');
});

test('every seeded product is still in the catalog at the end', async () => {
  const { status, body } = await api('/api/products');
  assert.equal(status, 200);
  const ids = new Set(body.map(product => product.id));
  for (const product of PRODUCTS) {
    assert.ok(ids.has(product.id), `${product.id} disappeared from the catalog`);
  }
});
