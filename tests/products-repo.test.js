/* Catalog integrity tests.
 *
 * The point of the products -> database migration is that the storefront keeps
 * receiving exactly what it received before, so the central test here compares
 * the database-backed output with products-data.js product by product. If a
 * field were dropped, renamed, reordered or coerced, this fails.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

// Point the client at a throwaway SQLite file *before* db.js is required,
// otherwise it would open (and seed) the real local database.
process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), 'bbvoltex-test-')), 'test.db')}`;
delete process.env.TURSO_AUTH_TOKEN;

const { PRODUCTS } = require('../server/products-data');
const repo = require('../server/products-repo');
const db = require('../server/db');

let catalog;

before(async () => {
  await db.init();
  await repo.seedProductsIfEmpty();
  catalog = await repo.listProducts();
});

after(async () => {
  await db.client.close();
});

test('the seed imports every product from products-data.js', async () => {
  assert.equal(catalog.length, PRODUCTS.length);
  assert.equal(await repo.countProducts(), PRODUCTS.length);
});

test('GET /api/products payload is unchanged: same values, same field order', async () => {
  // deepStrictEqual would ignore key order; the stringify comparison pins it, so
  // a reordered field is caught too.
  assert.deepStrictEqual(catalog, PRODUCTS);
  assert.equal(JSON.stringify(catalog), JSON.stringify(PRODUCTS));
});

test('optional fields stay absent, not null, when the product has none', async () => {
  const plain = catalog.find(p => p.id === 'p1');
  assert.ok(!('lot' in plain), 'p1 must not gain a lot key');
  assert.ok(!('images' in plain), 'p1 must not gain an images key');

  // `lot` is either true or a pack size, and the pack size must not collapse
  // into a boolean on the way through the database.
  const booleanLot = catalog.find(p => p.lot === true);
  const sizedLot = catalog.find(p => typeof p.lot === 'number');
  assert.ok(booleanLot, 'a product with lot: true round-trips as true');
  assert.ok(sizedLot, 'a product with a numeric pack size exists');
  assert.equal(sizedLot.lot, PRODUCTS.find(p => p.id === sizedLot.id).lot);

  const withImages = catalog.find(p => p.id === 'bj1');
  assert.ok(Array.isArray(withImages.images) && withImages.images.length > 0);
  assert.equal(typeof withImages.imagesByColor, 'object');
});

test('seeding twice does not duplicate the catalog', async () => {
  const second = await repo.seedProductsIfEmpty();
  assert.equal(second.seeded, 0);
  assert.equal(await repo.countProducts(), PRODUCTS.length);
});

test('getProductsByIds returns only the ids that exist', async () => {
  const found = await repo.getProductsByIds(['p1', 'does-not-exist', 'bj1', 'p1']);
  assert.equal(found.size, 2);
  assert.equal(found.get('p1').name, 'Camion en bois éducatif');
  assert.deepEqual([...(await repo.getProductsByIds([])).keys()], []);
});

/* ===================== VALIDATION ===================== */

test('a product cannot be created with a category the filters cannot reach', async () => {
  await assert.rejects(
    () => repo.createProduct({ category: 'drones', name: 'X', name_en: 'X', age: '3-5', ageLabel: '3-5 ans', ageLabel_en: '3-5 years', price: 10, iconKey: 'camion' }),
    /Unknown category/
  );
});

test('a product cannot be created with an unknown icon or a raw SVG', async () => {
  const base = { category: 'jouets', name: 'X', name_en: 'X', age: '3-5', ageLabel: '3-5 ans', ageLabel_en: '3-5 years', price: 10 };
  await assert.rejects(() => repo.createProduct({ ...base, iconKey: 'licorne' }), /Unknown iconKey/);
  // A raw SVG string must be refused: js/script.js injects the icon via
  // innerHTML, so accepting markup here would be a stored-XSS hole.
  await assert.rejects(
    () => repo.createProduct({ ...base, iconKey: '<svg onload="alert(1)"></svg>' }),
    /Unknown iconKey/
  );
});

test('an empty colors array is refused because it breaks add-to-cart', async () => {
  // js/script.js reads colors[0] and POST /api/cart/items requires a color,
  // so a product with no color can never be added to the cart.
  await assert.rejects(
    () => repo.createProduct({
      category: 'jouets', name: 'X', name_en: 'X', age: '3-5',
      ageLabel: '3-5 ans', ageLabel_en: '3-5 years', price: 10,
      iconKey: 'camion', colors: []
    }),
    /non-empty array/
  );
});

test('an empty size guide is refused because the modal reads rows[0]', async () => {
  await assert.rejects(
    () => repo.createProduct({
      category: 'jouets', name: 'X', name_en: 'X', age: '3-5',
      ageLabel: '3-5 ans', ageLabel_en: '3-5 years', price: 10,
      iconKey: 'camion', sizeGuide: []
    }),
    /non-empty array of rows/
  );
});

test('price must be positive and the required text fields must be present', async () => {
  await assert.rejects(
    () => repo.createProduct({ category: 'jouets', name: 'X', name_en: 'X', age: '3-5', ageLabel: 'a', ageLabel_en: 'a', price: 0, iconKey: 'camion' }),
    /price must be a positive number/
  );
  await assert.rejects(
    () => repo.createProduct({ category: 'jouets', name: 'X', name_en: 'X', age: '3-5', price: 10, iconKey: 'camion' }),
    /"ageLabel" is required/
  );
});

/* ===================== CREATE / UPDATE / DELETE ===================== */

test('a minimal product gets sane defaults the storefront can render', async () => {
  const created = await repo.createProduct({
    category: 'jouets',
    name: 'Peluche test',
    name_en: 'Test plush',
    age: '3-5',
    ageLabel: '3-5 ans',
    ageLabel_en: '3-5 years',
    price: 19.9,
    iconKey: 'peluche'
  });

  assert.equal(created.id, 'p13', 'continues the shared "p" sequence (p12 was the highest)');
  assert.deepEqual(created.colors, ['#ffffff'], 'default color keeps add-to-cart working');
  assert.deepEqual(created.sizeGuide[0], ['Caractéristique', 'Valeur'], 'header row keeps the modal from throwing');
  assert.equal(created.oldPrice, null);
  assert.equal(created.sale, false);
  assert.equal(created.universe, null);
  assert.equal(created.description, '', 'missing text degrades to an empty string, never "undefined"');
  assert.ok(!('lot' in created));
  assert.ok(!('images' in created));
  assert.equal(typeof created.icon, 'string');
  assert.match(created.icon, /^<svg/);
});

test('a new product is appended to the catalog order', async () => {
  const list = await repo.listProducts();
  assert.equal(list[list.length - 1].id, 'p13');
  assert.equal(list[0].id, 'p1', 'existing order is untouched');
});

test('ids continue the sequence of their own category prefix', async () => {
  const created = await repo.createProduct({
    category: 'bijoux', name: 'Collier test', name_en: 'Test necklace', age: 'ado',
    ageLabel: 'Ado', ageLabel_en: 'Teen', price: 12, iconKey: 'collier'
  });
  assert.equal(created.id, 'bj4');
});

test('PATCH changes one field and leaves the rest alone', async () => {
  const updated = await repo.updateProduct('p13', { price: 24.5, sale: true, oldPrice: 29.9 });
  assert.equal(updated.price, 24.5);
  assert.equal(updated.sale, true);
  assert.equal(updated.oldPrice, 29.9);
  assert.equal(updated.name, 'Peluche test');
  assert.equal(updated.category, 'jouets');
  await assert.rejects(() => repo.updateProduct('p13', {}), /No updatable field/);
  assert.equal(await repo.updateProduct('nope', { price: 1 }), null);
});

test('the same source URL cannot be imported twice', async () => {
  const payload = {
    category: 'maison', name: 'Lampe test', name_en: 'Test lamp', age: 'adulte',
    ageLabel: 'Adulte', ageLabel_en: 'Adult', price: 20, iconKey: 'lampe',
    sourceUrl: 'https://www.alibaba.com/product/123.html'
  };
  const first = await repo.createProduct(payload);
  assert.equal(first.id, 'm5');
  await assert.rejects(() => repo.createProduct(payload), /already exists for this source URL/);
});

test('DELETE removes the product and reports whether anything was deleted', async () => {
  assert.equal(await repo.deleteProduct('p13'), true);
  assert.equal(await repo.getProduct('p13'), null);
  assert.equal(await repo.deleteProduct('p13'), false);
  assert.equal(await repo.countProducts(), PRODUCTS.length + 2);
});
