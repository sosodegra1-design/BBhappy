/* Migration allemande : le point critique est que la base de production
 * contient 58 vrais produits. Ajouter des colonnes ne doit ni les perdre, ni
 * les modifier, ni casser une base créée avant l'arrivée de l'allemand.
 *
 * Le test construit donc une VRAIE base « ancienne » (schéma products sans
 * aucune colonne `_de`), y insère un produit, puis lance initDatabase() et
 * vérifie que la ligne a survécu intacte et que les colonnes sont apparues.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createClient } = require('@libsql/client');

// L'environnement doit être posé AVANT de require server/db.js, qui ouvre le
// client à l'import. On ne require donc ni db.js ni products-repo.js en haut.
process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), 'bbvoltex-de-migration-')), 'legacy.db')}`;
delete process.env.TURSO_AUTH_TOKEN;

/* Schéma products tel qu'il existait avant l'allemand (copie de l'ancien
   CREATE TABLE de server/db.js, sans name_de / age_label_de / …). */
const LEGACY_SCHEMA = `
  CREATE TABLE products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    universe TEXT,
    age TEXT NOT NULL,
    price REAL NOT NULL,
    old_price REAL,
    icon_key TEXT NOT NULL,
    bg TEXT NOT NULL,
    colors TEXT NOT NULL,
    sale INTEGER NOT NULL DEFAULT 0,
    lot TEXT,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    age_label TEXT NOT NULL,
    age_label_en TEXT NOT NULL,
    description TEXT NOT NULL,
    description_en TEXT NOT NULL,
    eco_details TEXT NOT NULL,
    eco_details_en TEXT NOT NULL,
    safety TEXT NOT NULL,
    safety_en TEXT NOT NULL,
    care TEXT NOT NULL,
    care_en TEXT NOT NULL,
    size_guide TEXT NOT NULL,
    size_guide_en TEXT NOT NULL,
    images TEXT,
    images_by_color TEXT,
    source_url TEXT,
    supplier_id INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );
`;

const GERMAN_COLUMNS = ['name_de', 'age_label_de', 'description_de', 'eco_details_de', 'safety_de', 'care_de', 'size_guide_de'];

let db;
let repo;
let catalog;

before(async () => {
  const raw = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: undefined });
  await raw.executeMultiple(LEGACY_SCHEMA);
  await raw.execute({
    sql: `INSERT INTO products
          (id, category, universe, age, price, old_price, icon_key, bg, colors, sale, lot,
           name, name_en, age_label, age_label_en, description, description_en,
           eco_details, eco_details_en, safety, safety_en, care, care_en,
           size_guide, size_guide_en, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'legacy-1', 'jouets', 'educatif', '3-5', 19.9, null, 'camion', '#f2ead6',
      JSON.stringify(['#ffffff']), 0, null,
      'Produit historique', 'Historic product', '3-5 ans', '3-5 years',
      'Description FR', 'Description EN', 'Éco FR', 'Éco EN',
      'Sécurité FR', 'Sécurité EN', 'Entretien FR', 'Entretien EN',
      JSON.stringify([['Âge', 'Taille'], ['3-5', '10 cm']]),
      JSON.stringify([['Age', 'Size'], ['3-5', '10 cm']]),
      0
    ]
  });
  await raw.close();

  db = require('../server/db');
  repo = require('../server/products-repo');
  await db.init();
  catalog = await repo.listProducts();
});

after(async () => {
  await db.client.close();
});

test('la migration ajoute les colonnes allemandes et garde les colonnes existantes', async () => {
  const info = await db.client.execute('PRAGMA table_info(products)');
  const columns = info.rows.map(row => row.name);

  for (const column of GERMAN_COLUMNS) {
    assert.ok(columns.includes(column), `colonne allemande manquante : ${column}`);
  }
  // Rien n'a été renommé ni supprimé.
  for (const column of ['id', 'name', 'name_en', 'age_label', 'age_label_en', 'description_en', 'size_guide_en', 'price', 'sort_order']) {
    assert.ok(columns.includes(column), `colonne historique perdue : ${column}`);
  }
});

test('la ligne existante survit intacte et les colonnes allemandes valent NULL', async () => {
  const res = await db.client.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: ['legacy-1'] });
  assert.equal(res.rows.length, 1, 'le produit de la base existante a disparu');

  const row = res.rows[0];
  assert.equal(row.name, 'Produit historique');
  assert.equal(row.name_en, 'Historic product');
  assert.equal(Number(row.price), 19.9);
  for (const column of GERMAN_COLUMNS) {
    assert.equal(row[column], null, `${column} doit rester NULL tant que rien n'est traduit`);
  }
});

test('GET /api/products omet les champs allemands absents (pas de undefined/null dans la page)', async () => {
  const product = catalog.find(p => p.id === 'legacy-1');
  assert.ok(product, 'le produit historique doit rester dans le catalogue');
  for (const field of ['name_de', 'ageLabel_de', 'description_de', 'ecoDetails_de', 'safety_de', 'care_de', 'sizeGuide_de']) {
    assert.ok(!(field in product), `${field} ne doit pas être émis tant qu'il est vide`);
  }
  assert.equal(product.name, 'Produit historique');
});

test('init() est idempotent et le relancer ne recharge pas de données', async () => {
  await db.init();
  await db.init();
  const res = await db.client.execute('SELECT COUNT(*) AS n FROM products');
  assert.equal(Number(res.rows[0].n), 1);
});

test('une base migrée déjà remplie reçoit le marqueur de seed sans être complétée', async () => {
  // Cas « le propriétaire a importé son propre catalogue » : le marqueur doit
  // être posé pour qu'une suppression manuelle ne déclenche jamais de
  // réimport des 58 produits historiques.
  const before = await db.client.execute('SELECT COUNT(*) AS n FROM products');
  const result = await repo.seedProductsIfEmpty();
  assert.equal(result.seeded, 0);
  assert.equal(result.reason, 'catalogue-present');

  const after = await db.client.execute('SELECT COUNT(*) AS n FROM products');
  assert.equal(Number(after.rows[0].n), Number(before.rows[0].n), 'aucun produit ne doit être ajouté');

  const marker = await db.client.execute({
    sql: 'SELECT value FROM app_state WHERE key = ?',
    args: [repo.SEED_MARKER_KEY]
  });
  assert.equal(marker.rows.length, 1, 'le marqueur de seed doit être écrit');
});
