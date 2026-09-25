/* Les champs allemands vus depuis la vraie surface HTTP : GET /api/products
 * doit les exposer dès qu'ils existent, et continuer à les OMETTRE tant qu'ils
 * sont vides (c'est ce que js/script.js utilise pour son repli DE -> EN -> FR).
 * L'écriture passe par l'API admin existante, dont le contrat X-Admin-Key ne
 * doit pas bouger.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), 'bbvoltex-de-api-')), 'api.db')}`;
delete process.env.TURSO_AUTH_TOKEN;
delete process.env.STRIPE_SECRET_KEY;
const ADMIN_KEY = 'test-admin-key-german-0123456789';
process.env.ADMIN_API_KEY = ADMIN_KEY;

const { app } = require('../server/index');
const db = require('../server/db');
const { seedProductsIfEmpty } = require('../server/products-repo');

let server;
let base;

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(base + path, { ...options, headers });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

const auth = { 'X-Admin-Key': ADMIN_KEY };

async function storefrontProduct(id) {
  const { body } = await api('/api/products');
  return body.find(product => product.id === id);
}

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

test('un produit non traduit n\'expose aucun champ allemand', async () => {
  const product = await storefrontProduct('p1');
  assert.ok(product, 'p1 doit exister');
  for (const field of ['name_de', 'ageLabel_de', 'description_de', 'ecoDetails_de', 'safety_de', 'care_de', 'sizeGuide_de']) {
    assert.ok(!(field in product), `${field} ne doit pas être émis quand il est vide`);
  }
});

test('l\'API admin accepte les champs allemands et GET /api/products les renvoie', async () => {
  const patch = {
    name_de: 'Pädagogischer Holzlaster',
    ageLabel_de: '0–2 Jahre',
    description_de: 'Laster aus massivem Buchenholz, geschliffen und wasserlackiert.',
    ecoDetails_de: 'Holz aus nachhaltig bewirtschafteten Wäldern (FSC).',
    safety_de: 'Entspricht der europäischen Spielzeugnorm CE EN71.',
    care_de: 'Mit einem leicht feuchten Tuch abwischen.',
    sizeGuide_de: [['Alter', 'Länge', 'Max. Gewicht'], ['0–2 Jahre', '22 cm', '2 kg']]
  };
  const { status, body } = await api('/api/admin/products/p1', {
    method: 'PATCH', headers: auth, body: JSON.stringify(patch)
  });
  assert.equal(status, 200);
  assert.equal(body.name_de, patch.name_de);
  assert.deepEqual(body.sizeGuide_de, patch.sizeGuide_de);

  const product = await storefrontProduct('p1');
  assert.equal(product.name_de, patch.name_de);
  assert.equal(product.ageLabel_de, patch.ageLabel_de);
  assert.equal(product.description_de, patch.description_de);
  assert.equal(product.ecoDetails_de, patch.ecoDetails_de);
  assert.equal(product.safety_de, patch.safety_de);
  assert.equal(product.care_de, patch.care_de);
  assert.deepEqual(product.sizeGuide_de, patch.sizeGuide_de);
  // Les champs FR/EN d'origine ne sont pas touchés par la traduction.
  assert.equal(product.name_en, 'Educational Wooden Truck');
  assert.equal(product.name, 'Camion en bois éducatif');

  // Un autre produit, non traduit, reste sans clé allemande.
  const other = await storefrontProduct('p2');
  assert.ok(!('name_de' in other));
});

test('une grille de tailles allemande vide est refusée (le modal lit rows[0])', async () => {
  const { status, body } = await api('/api/admin/products/p1', {
    method: 'PATCH', headers: auth, body: JSON.stringify({ sizeGuide_de: [] })
  });
  assert.equal(status, 400);
  assert.match(body.error, /non-empty array of rows/);
});

test('le contrat X-Admin-Key reste inchangé', async () => {
  assert.equal((await api('/api/products')).status, 200);
  assert.equal((await api('/api/admin/products/p1', { method: 'PATCH', body: JSON.stringify({ name_de: 'X' }) })).status, 401);
  assert.equal((await api('/api/admin/products/p1', { method: 'PATCH', headers: auth, body: JSON.stringify({ name_de: 'X' }) })).status, 200);
});
