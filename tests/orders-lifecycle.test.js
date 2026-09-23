/* Order lifecycle: real shipping/delivery/return status, replacing the old
 * fake elapsed-time tracking simulation. Exercises the same HTTP surface a
 * real client (Megalomarket, or a customer on suivi.html) would hit.
 */

const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), 'bbvoltex-orders-')), 'orders.db')}`;
delete process.env.TURSO_AUTH_TOKEN;
delete process.env.STRIPE_SECRET_KEY;
const ADMIN_KEY = 'test-admin-key-0123456789';
process.env.ADMIN_API_KEY = ADMIN_KEY;

const { app } = require('../server/index');
const db = require('../server/db');
const { seedProductsIfEmpty } = require('../server/products-repo');

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

/* Places a real order through the no-Stripe checkout fallback (this test
   suite never sets STRIPE_SECRET_KEY) and returns its order number + email,
   so each test starts from a genuine, paid order rather than a hand-crafted
   row. */
async function placeOrder(email = `buyer-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`) {
  const products = await api('/api/products');
  const productId = products.body[0].id;
  const color = products.body[0].colors ? products.body[0].colors[0] : '#ffffff';
  const added = await api('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId, color, qty: 1 }) });
  assert.equal(added.status, 201, JSON.stringify(added.body));

  const checkout = await api('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ name: 'Ada Test', email, address: '1 rue Test', zip: '75000', city: 'Paris' })
  });
  assert.equal(checkout.status, 201, JSON.stringify(checkout.body));
  return { orderNumber: checkout.body.orderNumber, email };
}

beforeEach(() => { cookie = ''; });

test('a freshly placed order tracks as confirmed, with no fabricated future status', async () => {
  const { orderNumber, email } = await placeOrder();
  const res = await api(`/api/track?order=${orderNumber}&email=${encodeURIComponent(email)}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'confirmed');
  assert.equal(res.body.trackingNumber, null);
  assert.equal(res.body.canRequestReturn, false);

  const shipped = res.body.steps.find(s => s.key === 'shipped');
  const delivered = res.body.steps.find(s => s.key === 'delivered');
  assert.equal(shipped.done, false);
  assert.equal(shipped.date, null);
  assert.equal(delivered.done, false);
  assert.equal(delivered.date, null);
});

test('marking an order shipped requires real carrier + tracking info', async () => {
  const { orderNumber } = await placeOrder();
  const res = await api(`/api/admin/orders/${orderNumber}/ship`, {
    method: 'PATCH', headers: auth, body: JSON.stringify({ carrier: 'Colissimo' })
  });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /trackingNumber/);
});

test('ship then track: the real carrier and tracking link appear, never a fabricated one', async () => {
  const { orderNumber, email } = await placeOrder();
  const ship = await api(`/api/admin/orders/${orderNumber}/ship`, {
    method: 'PATCH',
    headers: auth,
    body: JSON.stringify({
      carrier: 'Colissimo',
      trackingNumber: '6A12345678901',
      trackingUrl: 'https://www.laposte.fr/outils/suivre-vos-envois?code=6A12345678901',
      labelUrl: 'https://panel.sendcloud.sc/label/123.pdf'
    })
  });
  assert.equal(ship.status, 200);
  assert.equal(ship.body.status, 'shipped');

  const track = await api(`/api/track?order=${orderNumber}&email=${encodeURIComponent(email)}`);
  assert.equal(track.body.status, 'shipped');
  assert.equal(track.body.carrier, 'Colissimo');
  assert.equal(track.body.trackingNumber, '6A12345678901');
  assert.equal(track.body.steps.find(s => s.key === 'shipped').done, true);
  assert.equal(track.body.steps.find(s => s.key === 'delivered').done, false);
});

test('cannot mark delivered before shipped', async () => {
  const { orderNumber } = await placeOrder();
  const res = await api(`/api/admin/orders/${orderNumber}/deliver`, { method: 'PATCH', headers: auth });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /shipped/);
});

test('marking delivered twice is idempotent (a repeated carrier webhook must not error)', async () => {
  const { orderNumber } = await placeOrder();
  await api(`/api/admin/orders/${orderNumber}/ship`, {
    method: 'PATCH', headers: auth,
    body: JSON.stringify({ carrier: 'DHL', trackingNumber: 'DHL123', trackingUrl: 'https://dhl.example/DHL123' })
  });
  const first = await api(`/api/admin/orders/${orderNumber}/deliver`, { method: 'PATCH', headers: auth });
  assert.equal(first.status, 200);
  assert.equal(first.body.order.status, 'delivered');
  assert.equal(first.body.alreadyDelivered, false);

  const second = await api(`/api/admin/orders/${orderNumber}/deliver`, { method: 'PATCH', headers: auth });
  assert.equal(second.status, 200);
  assert.equal(second.body.order.status, 'delivered');
  assert.equal(second.body.alreadyDelivered, true);
});

test('a return can only be requested once the order is genuinely delivered', async () => {
  const { orderNumber, email } = await placeOrder();
  const tooEarly = await api('/api/returns', {
    method: 'POST', body: JSON.stringify({ order: orderNumber, email, reason: 'Changed my mind' })
  });
  assert.equal(tooEarly.status, 400);
  assert.match(tooEarly.body.error, /delivered/);
});

test('a wrong email is refused exactly like /api/track (no order enumeration)', async () => {
  const { orderNumber } = await placeOrder();
  const res = await api('/api/returns', {
    method: 'POST', body: JSON.stringify({ order: orderNumber, email: 'someone-else@example.com', reason: 'x' })
  });
  assert.equal(res.status, 404);
});

test('full lifecycle: request a return after delivery, track reflects it, cannot double-request', async () => {
  const { orderNumber, email } = await placeOrder();
  await api(`/api/admin/orders/${orderNumber}/ship`, {
    method: 'PATCH', headers: auth,
    body: JSON.stringify({ carrier: 'UPS', trackingNumber: 'UPS999', trackingUrl: 'https://ups.example/UPS999' })
  });
  await api(`/api/admin/orders/${orderNumber}/deliver`, { method: 'PATCH', headers: auth });

  const beforeReturn = await api(`/api/track?order=${orderNumber}&email=${encodeURIComponent(email)}`);
  assert.equal(beforeReturn.body.canRequestReturn, true);

  const requested = await api('/api/returns', {
    method: 'POST', body: JSON.stringify({ order: orderNumber, email, reason: 'Ne convient pas' })
  });
  assert.equal(requested.status, 201);
  assert.equal(requested.body.returnStatus, 'requested');

  const afterReturn = await api(`/api/track?order=${orderNumber}&email=${encodeURIComponent(email)}`);
  assert.equal(afterReturn.body.canRequestReturn, false);
  assert.equal(afterReturn.body.returnStatus, 'requested');

  const doubleRequest = await api('/api/returns', {
    method: 'POST', body: JSON.stringify({ order: orderNumber, email, reason: 'again' })
  });
  assert.equal(doubleRequest.status, 400);

  const handled = await api(`/api/admin/orders/${orderNumber}/return`, {
    method: 'PATCH', headers: auth,
    body: JSON.stringify({ returnStatus: 'label_sent', returnLabelUrl: 'https://panel.sendcloud.sc/return/456.pdf' })
  });
  assert.equal(handled.status, 200);
  assert.equal(handled.body.returnStatus, 'label_sent');
  assert.equal(handled.body.returnLabelUrl, 'https://panel.sendcloud.sc/return/456.pdf');
});

test('the admin orders list requires the admin key, like every other admin route', async () => {
  const res = await api('/api/admin/orders');
  assert.equal(res.status, 401);
});
