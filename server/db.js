const path = require('path');
const { createClient } = require('@libsql/client');

/* In production, point TURSO_DATABASE_URL / TURSO_AUTH_TOKEN at a free Turso
   database (see README) so the data survives redeploys. With no env vars set
   it falls back to a local SQLite file, so `npm start` still works with zero
   setup during local development. */
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'bbhappy.db')}`,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function init() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      color TEXT NOT NULL,
      qty INTEGER NOT NULL,
      UNIQUE(cart_id, product_id, color)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      PRIMARY KEY (cart_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS loyalty (
      cart_id TEXT PRIMARY KEY,
      points INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      name TEXT,
      email TEXT,
      address TEXT,
      zip TEXT,
      city TEXT,
      total REAL NOT NULL,
      points_earned INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      stripe_session_id TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      color TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);

  // Migration for databases created before Stripe support was added: the
  // CREATE TABLE above only applies to brand-new tables, so existing
  // deployments need the column added explicitly. Safe to run every startup.
  try {
    await client.execute('ALTER TABLE orders ADD COLUMN stripe_session_id TEXT UNIQUE');
  } catch (err) {
    if (!/duplicate column name/i.test(err.message)) throw err;
  }
}

module.exports = { client, init };
