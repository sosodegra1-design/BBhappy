const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');
const { PRODUCTS, LOYALTY_TIERS } = require('./products-data');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const app = express();
const ROOT = path.join(__dirname, '..');
const PRODUCTS_BY_ID = new Map(PRODUCTS.map(p => [p.id, p]));

// Render (and most PaaS) terminate TLS at a reverse proxy and forward plain
// HTTP internally; without this, req.protocol would report "http" and the
// Stripe success/cancel URLs we build from it would be wrong.
app.set('trust proxy', 1);

app.use(express.json());

/* ===================== CLIENT / CART IDENTIFICATION =====================
   No accounts here — a random id is issued as a cookie on first visit and
   used as the key for that visitor's cart, favorites and loyalty points. */
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

app.use((req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  let cid = cookies.bbhappy_cid;
  if (!cid) {
    cid = crypto.randomUUID();
    res.setHeader('Set-Cookie', `bbhappy_cid=${cid}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`);
  }
  req.cartId = cid;
  next();
});

/* ===================== HELPERS ===================== */
async function getCartRows(cartId) {
  const res = await db.client.execute({
    sql: 'SELECT id, product_id, color, qty FROM cart_items WHERE cart_id = ?',
    args: [cartId]
  });
  return res.rows;
}

async function cartWithProducts(cartId) {
  const rows = await getCartRows(cartId);
  const items = [];
  let total = 0;
  for (const row of rows) {
    const product = PRODUCTS_BY_ID.get(row.product_id);
    if (!product) continue; // stale reference, ignore
    const qty = Number(row.qty);
    items.push({ itemId: Number(row.id), productId: row.product_id, color: row.color, qty, product });
    total += product.price * qty;
  }
  return { items, total: Math.round(total * 100) / 100 };
}

async function getLoyaltyPoints(cartId) {
  const res = await db.client.execute({
    sql: 'SELECT points FROM loyalty WHERE cart_id = ?',
    args: [cartId]
  });
  return res.rows.length ? Number(res.rows[0].points) : 0;
}

async function addLoyaltyPoints(cartId, amount) {
  await db.client.execute({
    sql: `INSERT INTO loyalty (cart_id, points) VALUES (?, ?)
          ON CONFLICT(cart_id) DO UPDATE SET points = points + excluded.points`,
    args: [cartId, amount]
  });
  return getLoyaltyPoints(cartId);
}

/* ===================== PRODUCTS ===================== */
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

/* ===================== CART ===================== */
app.get('/api/cart', async (req, res, next) => {
  try {
    res.json(await cartWithProducts(req.cartId));
  } catch (err) { next(err); }
});

app.post('/api/cart/items', async (req, res, next) => {
  try {
    const { productId, color, qty } = req.body || {};
    const quantity = Number.isInteger(qty) && qty > 0 ? qty : 1;
    if (!productId || !PRODUCTS_BY_ID.has(productId)) {
      return res.status(400).json({ error: 'Unknown productId.' });
    }
    if (!color || typeof color !== 'string') {
      return res.status(400).json({ error: 'A color must be provided.' });
    }
    await db.client.execute({
      sql: `INSERT INTO cart_items (cart_id, product_id, color, qty) VALUES (?, ?, ?, ?)
            ON CONFLICT(cart_id, product_id, color) DO UPDATE SET qty = qty + excluded.qty`,
      args: [req.cartId, productId, color, quantity]
    });
    res.status(201).json(await cartWithProducts(req.cartId));
  } catch (err) { next(err); }
});

app.patch('/api/cart/items/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const { qty } = req.body || {};
    if (!Number.isInteger(qty)) {
      return res.status(400).json({ error: 'qty must be an integer.' });
    }
    const owned = await db.client.execute({
      sql: 'SELECT id FROM cart_items WHERE id = ? AND cart_id = ?',
      args: [itemId, req.cartId]
    });
    if (owned.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }
    if (qty <= 0) {
      await db.client.execute({ sql: 'DELETE FROM cart_items WHERE id = ?', args: [itemId] });
    } else {
      await db.client.execute({ sql: 'UPDATE cart_items SET qty = ? WHERE id = ?', args: [qty, itemId] });
    }
    res.json(await cartWithProducts(req.cartId));
  } catch (err) { next(err); }
});

app.delete('/api/cart/items/:itemId', async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    await db.client.execute({
      sql: 'DELETE FROM cart_items WHERE id = ? AND cart_id = ?',
      args: [itemId, req.cartId]
    });
    res.json(await cartWithProducts(req.cartId));
  } catch (err) { next(err); }
});

app.delete('/api/cart', async (req, res, next) => {
  try {
    await db.client.execute({ sql: 'DELETE FROM cart_items WHERE cart_id = ?', args: [req.cartId] });
    res.json(await cartWithProducts(req.cartId));
  } catch (err) { next(err); }
});

/* ===================== FAVORITES ===================== */
app.get('/api/favorites', async (req, res, next) => {
  try {
    const result = await db.client.execute({
      sql: 'SELECT product_id FROM favorites WHERE cart_id = ?',
      args: [req.cartId]
    });
    const productIds = result.rows.map(r => r.product_id).filter(id => PRODUCTS_BY_ID.has(id));
    res.json({ productIds });
  } catch (err) { next(err); }
});

app.post('/api/favorites/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!PRODUCTS_BY_ID.has(productId)) {
      return res.status(400).json({ error: 'Unknown productId.' });
    }
    await db.client.execute({
      sql: 'INSERT OR IGNORE INTO favorites (cart_id, product_id) VALUES (?, ?)',
      args: [req.cartId, productId]
    });
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

app.delete('/api/favorites/:productId', async (req, res, next) => {
  try {
    await db.client.execute({
      sql: 'DELETE FROM favorites WHERE cart_id = ? AND product_id = ?',
      args: [req.cartId, req.params.productId]
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/* ===================== LOYALTY ===================== */
// A stable, readable "member number" derived from the visitor's cart id, so
// the virtual card has something card-like to show without needing accounts.
function memberNumber(cartId) {
  return crypto.createHash('sha256').update(cartId).digest('hex').slice(0, 8).toUpperCase();
}

async function hasRequestedPhysicalCard(cartId) {
  const res = await db.client.execute({
    sql: 'SELECT 1 FROM physical_card_requests WHERE cart_id = ?',
    args: [cartId]
  });
  return res.rows.length > 0;
}

app.get('/api/loyalty', async (req, res, next) => {
  try {
    res.json({
      points: await getLoyaltyPoints(req.cartId),
      tiers: LOYALTY_TIERS,
      memberNumber: memberNumber(req.cartId),
      physicalCardRequested: await hasRequestedPhysicalCard(req.cartId)
    });
  } catch (err) { next(err); }
});

app.post('/api/loyalty/bonus', async (req, res, next) => {
  try {
    const { amount } = req.body || {};
    const bonus = Number.isInteger(amount) && amount > 0 ? amount : 0;
    if (bonus === 0) {
      return res.status(400).json({ error: 'amount must be a positive integer.' });
    }
    res.json({ points: await addLoyaltyPoints(req.cartId, bonus) });
  } catch (err) { next(err); }
});

app.post('/api/loyalty/physical-card', async (req, res, next) => {
  try {
    const { name, address, zip, city } = req.body || {};
    if (!name || !address || !zip || !city) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    await db.client.execute({
      sql: `INSERT INTO physical_card_requests (cart_id, name, address, zip, city, requested_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(cart_id) DO UPDATE SET
              name = excluded.name, address = excluded.address,
              zip = excluded.zip, city = excluded.city, requested_at = excluded.requested_at`,
      args: [req.cartId, name, address, zip, city, new Date().toISOString()]
    });
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

/* ===================== CHECKOUT ===================== */
/* Records the order, its line items, empties the cart and credits loyalty
   points. Shared by the no-Stripe fallback and the post-payment confirmation
   so an order is only ever created once, with a consistent shape. */
async function createOrder(cartId, customer, stripeSessionId = null) {
  const { name, email, address, zip, city } = customer;
  const { items, total } = await cartWithProducts(cartId);
  if (items.length === 0) {
    throw Object.assign(new Error('Cart is empty.'), { status: 400 });
  }

  const orderId = 'BB' + Date.now().toString().slice(-8);
  const pointsEarned = Math.round(total);
  const createdAt = new Date().toISOString();

  await db.client.execute({
    sql: `INSERT INTO orders (id, cart_id, name, email, address, zip, city, total, points_earned, created_at, stripe_session_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [orderId, cartId, name, email, address, zip, city, total, pointsEarned, createdAt, stripeSessionId]
  });

  for (const item of items) {
    await db.client.execute({
      sql: 'INSERT INTO order_items (order_id, product_id, color, qty, price) VALUES (?, ?, ?, ?, ?)',
      args: [orderId, item.productId, item.color, item.qty, item.product.price]
    });
  }

  await db.client.execute({ sql: 'DELETE FROM cart_items WHERE cart_id = ?', args: [cartId] });
  await addLoyaltyPoints(cartId, pointsEarned);

  return { orderNumber: orderId, pointsEarned, total };
}

app.post('/api/checkout', async (req, res, next) => {
  try {
    const { name, email, address, zip, city } = req.body || {};
    if (!name || !email || !address || !zip || !city) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (stripe) {
      // Real payment: hand off to Stripe Checkout instead of creating the
      // order immediately. The order is only recorded once Stripe confirms
      // the payment actually went through (see /api/checkout/confirm).
      const { items } = await cartWithProducts(req.cartId);
      if (items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
      }
      const origin = `${req.protocol}://${req.get('host')}`;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: items.map(item => ({
          quantity: item.qty,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(item.product.price * 100),
            product_data: { name: `${item.product.name} (${item.color})` }
          }
        })),
        metadata: { cartId: req.cartId, name, email, address, zip, city },
        success_url: `${origin}/index.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/index.html?checkout=cancelled`
      });
      return res.json({ redirectUrl: session.url });
    }

    // No STRIPE_SECRET_KEY configured (e.g. local dev without a Stripe
    // account): fall back to creating the order immediately, with no real
    // payment collected — keeps `npm start` fully testable with zero setup.
    const order = await createOrder(req.cartId, { name, email, address, zip, city });
    res.status(201).json(order);
  } catch (err) { next(err); }
});

app.get('/api/checkout/confirm', async (req, res, next) => {
  try {
    if (!stripe) return res.status(400).json({ error: 'Stripe is not configured.' });
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id is required.' });

    // Idempotent: a page refresh on the success URL must not create a second order.
    const existing = await db.client.execute({
      sql: 'SELECT id, points_earned, total FROM orders WHERE stripe_session_id = ?',
      args: [session_id]
    });
    if (existing.rows.length) {
      const row = existing.rows[0];
      return res.json({ orderNumber: row.id, pointsEarned: Number(row.points_earned), total: Number(row.total) });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed.' });
    }
    const { cartId, name, email, address, zip, city } = session.metadata;
    const order = await createOrder(cartId, { name, email, address, zip, city }, session_id);
    res.status(201).json(order);
  } catch (err) { next(err); }
});

/* ===================== ERROR HANDLING ===================== */
app.use('/api', (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error.' });
});

/* ===================== STATIC FRONTEND ===================== */
// Keep the server source and package files from being served alongside the site.
const BLOCKED_PREFIXES = ['/server', '/node_modules', '/package.json', '/package-lock.json'];
app.use((req, res, next) => {
  if (BLOCKED_PREFIXES.some(prefix => req.path === prefix || req.path.startsWith(prefix + '/'))) {
    return res.status(404).end();
  }
  next();
});
app.use(express.static(ROOT));

const PORT = process.env.PORT || 3000;

async function start() {
  await db.init();
  app.listen(PORT, () => {
    console.log(`BBHappY running at http://localhost:${PORT}`);
    console.log(`Database: ${process.env.TURSO_DATABASE_URL ? 'Turso (' + process.env.TURSO_DATABASE_URL + ')' : 'local SQLite file (server/bbhappy.db)'}`);
  });
}

start().catch(err => {
  console.error('Failed to start BBHappY server:', err);
  process.exit(1);
});
