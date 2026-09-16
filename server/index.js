const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');
const { PRODUCTS, LOYALTY_TIERS } = require('./products-data');

const app = express();
const ROOT = path.join(__dirname, '..');
const PRODUCTS_BY_ID = new Map(PRODUCTS.map(p => [p.id, p]));

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
function getCartRows(cartId) {
  return db.prepare('SELECT id, product_id, color, qty FROM cart_items WHERE cart_id = ?').all(cartId);
}

function cartWithProducts(cartId) {
  const rows = getCartRows(cartId);
  const items = [];
  let total = 0;
  for (const row of rows) {
    const product = PRODUCTS_BY_ID.get(row.product_id);
    if (!product) continue; // stale reference, ignore
    items.push({ itemId: row.id, productId: row.product_id, color: row.color, qty: row.qty, product });
    total += product.price * row.qty;
  }
  return { items, total: Math.round(total * 100) / 100 };
}

function getLoyaltyPoints(cartId) {
  const row = db.prepare('SELECT points FROM loyalty WHERE cart_id = ?').get(cartId);
  return row ? row.points : 0;
}

function addLoyaltyPoints(cartId, amount) {
  db.prepare(`
    INSERT INTO loyalty (cart_id, points) VALUES (?, ?)
    ON CONFLICT(cart_id) DO UPDATE SET points = points + excluded.points
  `).run(cartId, amount);
  return getLoyaltyPoints(cartId);
}

/* ===================== PRODUCTS ===================== */
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

/* ===================== CART ===================== */
app.get('/api/cart', (req, res) => {
  res.json(cartWithProducts(req.cartId));
});

app.post('/api/cart/items', (req, res) => {
  const { productId, color, qty } = req.body || {};
  const quantity = Number.isInteger(qty) && qty > 0 ? qty : 1;
  if (!productId || !PRODUCTS_BY_ID.has(productId)) {
    return res.status(400).json({ error: 'Unknown productId.' });
  }
  if (!color || typeof color !== 'string') {
    return res.status(400).json({ error: 'A color must be provided.' });
  }
  db.prepare(`
    INSERT INTO cart_items (cart_id, product_id, color, qty) VALUES (?, ?, ?, ?)
    ON CONFLICT(cart_id, product_id, color) DO UPDATE SET qty = qty + excluded.qty
  `).run(req.cartId, productId, color, quantity);
  res.status(201).json(cartWithProducts(req.cartId));
});

app.patch('/api/cart/items/:itemId', (req, res) => {
  const itemId = Number(req.params.itemId);
  const { qty } = req.body || {};
  if (!Number.isInteger(qty)) {
    return res.status(400).json({ error: 'qty must be an integer.' });
  }
  const owned = db.prepare('SELECT id FROM cart_items WHERE id = ? AND cart_id = ?').get(itemId, req.cartId);
  if (!owned) {
    return res.status(404).json({ error: 'Cart item not found.' });
  }
  if (qty <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
  } else {
    db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(qty, itemId);
  }
  res.json(cartWithProducts(req.cartId));
});

app.delete('/api/cart/items/:itemId', (req, res) => {
  const itemId = Number(req.params.itemId);
  db.prepare('DELETE FROM cart_items WHERE id = ? AND cart_id = ?').run(itemId, req.cartId);
  res.json(cartWithProducts(req.cartId));
});

app.delete('/api/cart', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(req.cartId);
  res.json(cartWithProducts(req.cartId));
});

/* ===================== FAVORITES ===================== */
app.get('/api/favorites', (req, res) => {
  const rows = db.prepare('SELECT product_id FROM favorites WHERE cart_id = ?').all(req.cartId);
  const productIds = rows.map(r => r.product_id).filter(id => PRODUCTS_BY_ID.has(id));
  res.json({ productIds });
});

app.post('/api/favorites/:productId', (req, res) => {
  const { productId } = req.params;
  if (!PRODUCTS_BY_ID.has(productId)) {
    return res.status(400).json({ error: 'Unknown productId.' });
  }
  db.prepare('INSERT OR IGNORE INTO favorites (cart_id, product_id) VALUES (?, ?)').run(req.cartId, productId);
  res.status(201).json({ ok: true });
});

app.delete('/api/favorites/:productId', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE cart_id = ? AND product_id = ?').run(req.cartId, req.params.productId);
  res.json({ ok: true });
});

/* ===================== LOYALTY ===================== */
app.get('/api/loyalty', (req, res) => {
  res.json({ points: getLoyaltyPoints(req.cartId), tiers: LOYALTY_TIERS });
});

app.post('/api/loyalty/bonus', (req, res) => {
  const { amount } = req.body || {};
  const bonus = Number.isInteger(amount) && amount > 0 ? amount : 0;
  if (bonus === 0) {
    return res.status(400).json({ error: 'amount must be a positive integer.' });
  }
  res.json({ points: addLoyaltyPoints(req.cartId, bonus) });
});

/* ===================== CHECKOUT ===================== */
app.post('/api/checkout', (req, res) => {
  const { name, email, address, zip, city } = req.body || {};
  if (!name || !email || !address || !zip || !city) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const { items, total } = cartWithProducts(req.cartId);
  if (items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const orderId = 'BB' + Date.now().toString().slice(-8);
  const pointsEarned = Math.round(total);
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders (id, cart_id, name, email, address, zip, city, total, points_earned, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderId, req.cartId, name, email, address, zip, city, total, pointsEarned, createdAt);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, color, qty, price) VALUES (?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insertItem.run(orderId, item.productId, item.color, item.qty, item.product.price);
  }

  db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(req.cartId);
  addLoyaltyPoints(req.cartId, pointsEarned);

  res.status(201).json({ orderNumber: orderId, pointsEarned, total });
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
app.listen(PORT, () => {
  console.log(`BBHappY running at http://localhost:${PORT}`);
});
