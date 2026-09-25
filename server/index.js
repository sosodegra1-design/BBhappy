const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');
const { LOYALTY_TIERS, colorLabel } = require('./products-data');
const { getProductsByIds, listProducts, getProduct, seedProductsIfEmpty } = require('./products-repo');
const ordersRepo = require('./orders-repo');
const { admin } = require('./admin');

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const app = express();
const ROOT = path.join(__dirname, '..');

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
  // One query for the whole cart rather than one per line.
  const products = await getProductsByIds(rows.map(row => row.product_id));
  const items = [];
  let total = 0;
  for (const row of rows) {
    const product = products.get(row.product_id);
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
app.get('/api/products', async (req, res, next) => {
  try {
    res.json(await listProducts());
  } catch (err) { next(err); }
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
    if (!productId || !(await getProduct(productId))) {
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
    const ids = result.rows.map(r => r.product_id);
    const products = await getProductsByIds(ids);
    const productIds = ids.filter(id => products.has(id));
    res.json({ productIds });
  } catch (err) { next(err); }
});

app.post('/api/favorites/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!(await getProduct(productId))) {
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
      sql: 'INSERT INTO order_items (order_id, product_id, color, qty, price, name) VALUES (?, ?, ?, ?, ?, ?)',
      args: [orderId, item.productId, item.color, item.qty, item.product.price, item.product.name]
    });
  }

  await db.client.execute({ sql: 'DELETE FROM cart_items WHERE cart_id = ?', args: [cartId] });
  await addLoyaltyPoints(cartId, pointsEarned);

  // Named explicitly in the response so the confirmation screen can spell
  // out exactly what's being shipped — a swatch dot alone left customers
  // unsure whether they'd receive the gold or rose-gold version.
  const orderItems = items.map(item => ({
    name: item.product.name,
    color: item.color,
    colorName: item.product.colors.length > 1 ? colorLabel(item.color) : null,
    qty: item.qty,
    price: item.product.price
  }));

  return { orderNumber: orderId, email, pointsEarned, total, items: orderItems };
}

/* Rebuilds the same { name, color, colorName, qty, price } shape as
   createOrder()'s response, for the idempotent "already recorded" replies
   below (a refresh of the success page must show the same confirmation).
   The name is read from the snapshotted column, so a product deleted after the
   sale still shows its real name; the catalog lookup is only a fallback for
   lines written before that column existed. */
async function orderItemsFor(orderId) {
  const res = await db.client.execute({
    sql: 'SELECT product_id, color, qty, price, name FROM order_items WHERE order_id = ?',
    args: [orderId]
  });
  const products = await getProductsByIds(res.rows.map(row => row.product_id));
  return res.rows.map(row => {
    const product = products.get(row.product_id);
    return {
      name: row.name || (product ? product.name : row.product_id),
      color: row.color,
      colorName: product && product.colors.length > 1 ? colorLabel(row.color) : null,
      qty: Number(row.qty),
      price: Number(row.price)
    };
  });
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
            product_data: { name: item.product.colors.length > 1 ? `${item.product.name} (${colorLabel(item.color)})` : item.product.name }
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
      sql: 'SELECT id, email, points_earned, total FROM orders WHERE stripe_session_id = ?',
      args: [session_id]
    });
    if (existing.rows.length) {
      const row = existing.rows[0];
      return res.json({
        orderNumber: row.id, email: row.email, pointsEarned: Number(row.points_earned), total: Number(row.total),
        items: await orderItemsFor(row.id)
      });
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

/* ===================== ORDER TRACKING =====================
   Used to derive "shipped"/"delivered" from elapsed time alone — a clock,
   not a fact, that would tell a customer their parcel shipped or arrived
   whether or not it actually had. Real shipping and delivery are recorded by
   Megalomarket (server/orders-repo.js: markShipped / markDelivered), driven
   by a genuine Sendcloud shipment and a genuine carrier webhook — this route
   only ever reports what's actually in that table. A step with no real event
   yet simply carries no date, rather than a guessed one. */
app.get('/api/track', async (req, res, next) => {
  try {
    const orderNumber = String(req.query.order || '').trim().toUpperCase();
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!orderNumber || !email) {
      return res.status(400).json({ error: 'Order number and email are required.' });
    }

    const order = await ordersRepo.getOrder(orderNumber);
    if (!order || String(order.email || '').trim().toLowerCase() !== email) {
      return res.status(404).json({ error: 'No order matches this number and email.' });
    }

    const steps = [
      { key: 'confirmed', label: 'Commande confirmée', label_en: 'Order confirmed', done: true, date: order.createdAt },
      // "Being prepared" has no real distinct signal of its own — it simply
      // means "paid, not yet shipped" — so it carries no fabricated date.
      { key: 'preparing', label: 'En préparation', label_en: 'Being prepared', done: true, date: null },
      { key: 'shipped', label: 'Expédiée', label_en: 'Shipped', done: order.status === 'shipped' || order.status === 'delivered', date: order.shippedAt },
      { key: 'delivered', label: 'Livrée', label_en: 'Delivered', done: order.status === 'delivered', date: order.deliveredAt }
    ];

    res.json({
      orderNumber: order.id,
      total: order.total,
      status: order.status,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      steps,
      // Lets the tracking page offer "request a return" only once delivered
      // and only if one isn't already in progress — and shows the customer
      // where an existing request stands instead of a dead end.
      canRequestReturn: order.status === 'delivered' && !order.returnStatus,
      returnStatus: order.returnStatus,
      returnLabelUrl: order.returnLabelUrl
    });
  } catch (err) { next(err); }
});

/* Public return request: the customer proves ownership of the order the
   same way /api/track does (order number + the email used at checkout), no
   account required. Genuinely creates a "return requested" event that
   Megalomarket's scheduler picks up to draft return instructions and (when
   possible) a real return label — nothing here is auto-approved. */
app.post('/api/returns', async (req, res, next) => {
  try {
    const orderNumber = String((req.body || {}).order || '').trim().toUpperCase();
    const email = String((req.body || {}).email || '').trim().toLowerCase();
    const reason = String((req.body || {}).reason || '').trim().slice(0, 2000);
    if (!orderNumber || !email) {
      return res.status(400).json({ error: 'Order number and email are required.' });
    }
    if (!reason) {
      return res.status(400).json({ error: 'A reason for the return is required.' });
    }
    const order = await ordersRepo.requestReturn(orderNumber, email, reason);
    res.status(201).json({ orderNumber: order.id, returnStatus: order.returnStatus });
  } catch (err) { next(err); }
});

/* ===================== ADMIN API ===================== */
// Authenticated write access to the catalog and to the supplier/distributor
// lists. Mounted before the error handler so admin errors share one shape.
app.use('/api/admin', admin);

/* ===================== ERROR HANDLING ===================== */
app.use('/api', (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error.' });
});

/* ===================== STATIC FRONTEND ===================== */
// Keep the server source, the local import tooling and the internal project
// documents from being served alongside the site. express.static() serves the
// whole repository root, so anything not listed here is downloadable by anyone
// who guesses the path. Compared case-insensitively so that a hit on a
// case-insensitive filesystem (local dev on macOS/Windows) behaves exactly like
// production, where the filesystem is case-sensitive.
const BLOCKED_PREFIXES = ['/server', '/node_modules', '/scripts', '/.github', '/package.json', '/package-lock.json'];
const BLOCKED_FILES = ['/readme.md', '/bbvoltex.md', '/bbvoltex.pdf'];
app.use((req, res, next) => {
  const path = req.path.toLowerCase();
  if (BLOCKED_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix + '/')) ||
      BLOCKED_FILES.includes(path)) {
    return res.status(404).end();
  }
  next();
});
app.use(express.static(ROOT));

const PORT = process.env.PORT || 3000;

async function start() {
  await db.init();
  // Importe le catalogue historique UNE SEULE FOIS (marqueur durable
  // `products_seeded` en base), jamais « quand la table est vide » : sinon un
  // propriétaire qui supprime volontairement tous ses produits les verrait
  // réapparaître au déploiement suivant. Voir products-repo.js.
  const seeded = await seedProductsIfEmpty();
  if (seeded.seeded) {
    console.log(`Seeded ${seeded.seeded} products from products-data.js (first run on this database).`);
  }
  return app.listen(PORT, () => {
    console.log(`BBVOLTEX running at http://localhost:${PORT}`);
    console.log(`Database: ${process.env.TURSO_DATABASE_URL ? 'Turso (' + process.env.TURSO_DATABASE_URL + ')' : 'local SQLite file (server/bbhappy.db)'}`);
  });
}

// Only listen when executed directly, so tests can mount the app themselves.
if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start BBVOLTEX server:', err);
    process.exit(1);
  });
}

module.exports = { app, start };
