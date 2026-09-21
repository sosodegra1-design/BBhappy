/* Admin API — the write side of the catalog.
 *
 * Every route here mutates the live shop, so the whole router sits behind a
 * single shared-secret check. It fails CLOSED: if ADMIN_API_KEY is not set in
 * the environment, no admin route works at all. That matters because the
 * alternative (defaulting to open when unconfigured) is how a missing env var
 * on a fresh deploy silently becomes a public "delete my products" endpoint.
 */

const express = require('express');
const crypto = require('crypto');
const { client } = require('./db');
const {
  CATEGORIES,
  UNIVERSES,
  ICON_KEYS,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('./products-repo');

const KINDS = ['fournisseur', 'distributeur'];
const STATUSES = ['actif', 'inactif'];

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

/* Constant-time comparison, so the response time cannot be used to guess the
   key one character at a time. Lengths are compared first because
   timingSafeEqual throws on mismatched buffers. */
function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function presentedKey(req) {
  const header = req.get('x-admin-key');
  if (header) return header;
  const auth = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return match ? match[1] : null;
}

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return res.status(503).json({
      error: 'Admin API is disabled: ADMIN_API_KEY is not configured on the server.'
    });
  }
  const presented = presentedKey(req);
  if (!presented || !safeEqual(presented, expected)) {
    return res.status(401).json({ error: 'Invalid or missing admin key.' });
  }
  next();
}

/* ===================== SUPPLIERS / DISTRIBUTORS =====================
   One table, distinguished by `kind`: a supplier and a distributor differ only
   in what they sell to the shop, and duplicating the CRUD would double the
   surface for no benefit. */

function rowToParty(row) {
  return {
    id: Number(row.id),
    kind: row.kind,
    name: row.name,
    marginCoefficient: row.margin_coefficient == null ? null : Number(row.margin_coefficient),
    status: row.status,
    url: row.url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeParty(input, { partial = false, kind } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('A JSON object body is required.');
  }
  const has = key => Object.prototype.hasOwnProperty.call(input, key);
  const values = {};

  if (has('name') || !partial) {
    if (!input.name || typeof input.name !== 'string' || !input.name.trim()) {
      throw badRequest('"name" is required.');
    }
    values.name = input.name.trim();
  }

  const resolvedKind = kind || input.kind;
  if (resolvedKind !== undefined) {
    if (!KINDS.includes(resolvedKind)) {
      throw badRequest(`Unknown kind "${resolvedKind}". Allowed: ${KINDS.join(', ')}.`);
    }
    values.kind = resolvedKind;
  } else if (!partial) {
    values.kind = 'fournisseur';
  }

  if (has('marginCoefficient')) {
    if (input.marginCoefficient === null || input.marginCoefficient === '') {
      values.margin_coefficient = null;
    } else if (!Number.isFinite(input.marginCoefficient) || input.marginCoefficient <= 0) {
      throw badRequest('marginCoefficient must be null or a positive number.');
    } else {
      values.margin_coefficient = input.marginCoefficient;
    }
  }

  if (has('status')) {
    if (!STATUSES.includes(input.status)) {
      throw badRequest(`Unknown status "${input.status}". Allowed: ${STATUSES.join(', ')}.`);
    }
    values.status = input.status;
  } else if (!partial) {
    values.status = 'actif';
  }

  for (const field of ['url', 'notes']) {
    if (has(field)) values[field] = input[field] ? String(input[field]) : null;
  }

  return values;
}

async function listParties(kind) {
  const res = await client.execute({
    sql: 'SELECT * FROM suppliers WHERE kind = ? ORDER BY name COLLATE NOCASE ASC',
    args: [kind]
  });
  return res.rows.map(rowToParty);
}

async function getParty(id) {
  const res = await client.execute({ sql: 'SELECT * FROM suppliers WHERE id = ?', args: [Number(id)] });
  return res.rows.length ? rowToParty(res.rows[0]) : null;
}

async function createParty(kind, input) {
  const values = normalizeParty(input, { kind });
  const now = new Date().toISOString();
  const res = await client.execute({
    sql: `INSERT INTO suppliers (name, kind, margin_coefficient, status, url, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      values.name, values.kind, values.margin_coefficient ?? null, values.status,
      values.url ?? null, values.notes ?? null, now, now
    ]
  });
  return getParty(res.lastInsertRowid);
}

async function updateParty(id, patch) {
  const existing = await getParty(id);
  if (!existing) return null;
  const values = normalizeParty(patch, { partial: true });
  const columns = Object.keys(values);
  if (columns.length === 0) throw badRequest('No updatable field was provided.');
  await client.execute({
    sql: `UPDATE suppliers SET ${columns.map(column => `${column} = ?`).join(', ')}, updated_at = ? WHERE id = ?`,
    args: [...columns.map(column => values[column]), new Date().toISOString(), Number(id)]
  });
  return getParty(id);
}

/* Deleting a catalogue source must never delete the catalogue: the products
   it supplied are detached (supplier_id set to NULL) and stay on sale. The FK
   is declared in the schema, but SQLite only enforces it when foreign_keys is
   ON, which is not guaranteed per-connection here — so the detach is done
   explicitly rather than relied upon. */
async function deleteParty(id) {
  const existing = await getParty(id);
  if (!existing) return { deleted: false };
  await client.execute({ sql: 'UPDATE products SET supplier_id = NULL WHERE supplier_id = ?', args: [Number(id)] });
  const res = await client.execute({ sql: 'DELETE FROM suppliers WHERE id = ?', args: [Number(id)] });
  return { deleted: Number(res.rowsAffected) > 0 };
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

const admin = express.Router();
admin.use(requireAdmin);

/* Lets a caller discover the closed lists before generating a product, instead
   of guessing a category the storefront filters cannot reach. */
admin.get('/taxonomy', (req, res) => {
  res.json({ categories: CATEGORIES, universes: UNIVERSES, iconKeys: ICON_KEYS });
});

admin.get('/products', asyncRoute(async (req, res) => {
  res.json(await listProducts());
}));

admin.get('/products/:id', asyncRoute(async (req, res) => {
  const product = await getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
}));

admin.post('/products', asyncRoute(async (req, res) => {
  const product = await createProduct(req.body || {});
  res.status(201).json(product);
}));

admin.patch('/products/:id', asyncRoute(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body || {});
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
}));

admin.delete('/products/:id', asyncRoute(async (req, res) => {
  const deleted = await deleteProduct(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found.' });
  res.json({ ok: true, deleted: req.params.id });
}));

for (const kind of KINDS) {
  const base = kind === 'fournisseur' ? '/suppliers' : '/distributors';

  admin.get(base, asyncRoute(async (req, res) => {
    res.json(await listParties(kind));
  }));

  admin.post(base, asyncRoute(async (req, res) => {
    res.status(201).json(await createParty(kind, req.body || {}));
  }));

  admin.patch(`${base}/:id`, asyncRoute(async (req, res) => {
    const party = await updateParty(req.params.id, req.body || {});
    if (!party) return res.status(404).json({ error: 'Not found.' });
    res.json(party);
  }));

  admin.delete(`${base}/:id`, asyncRoute(async (req, res) => {
    const result = await deleteParty(req.params.id);
    if (!result.deleted) return res.status(404).json({ error: 'Not found.' });
    res.json({ ok: true });
  }));
}

module.exports = { admin, requireAdmin };
