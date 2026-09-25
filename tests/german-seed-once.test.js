/* Le seed du catalogue doit tourner UNE SEULE FOIS, jamais « quand la table
 * est vide ».
 *
 * Pourquoi c'est un test à part entière : si le seed se déclenche sur une
 * table vide, un propriétaire qui supprime volontairement tous ses produits
 * les voit ressusciter au déploiement suivant. Le marqueur durable
 * `products_seeded` (table app_state) est la correction ; ces tests le
 * verrouillent.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), 'bbvoltex-seed-once-')), 'seed.db')}`;
delete process.env.TURSO_AUTH_TOKEN;

const { PRODUCTS } = require('../server/products-data');
const repo = require('../server/products-repo');
const db = require('../server/db');

async function markerValue() {
  const res = await db.client.execute({
    sql: 'SELECT value FROM app_state WHERE key = ?',
    args: [repo.SEED_MARKER_KEY]
  });
  return res.rows.length ? res.rows[0].value : null;
}

before(async () => {
  await db.init();
});

after(async () => {
  await db.client.close();
});

test('une base vierge importe le catalogue une fois et écrit le marqueur', async () => {
  const first = await repo.seedProductsIfEmpty();
  assert.equal(first.seeded, PRODUCTS.length);
  assert.equal(await repo.countProducts(), PRODUCTS.length);
  assert.ok(await markerValue(), 'le marqueur products_seeded doit être écrit');
});

test('un second démarrage ne réécrit rien', async () => {
  const before = await markerValue();
  const second = await repo.seedProductsIfEmpty();
  assert.equal(second.seeded, 0);
  assert.equal(second.reason, 'already-seeded');
  assert.equal(await markerValue(), before, 'le marqueur ne doit pas être réécrit à chaque démarrage');
  assert.equal(await repo.countProducts(), PRODUCTS.length, 'aucun doublon ne doit apparaître');
});

test('une base neuve déjà remplie par un autre import reçoit quand même le marqueur', async () => {
  // On simule un import personnel : catalogue vidé, marqueur retiré, un seul
  // produit posé à la main.
  await db.client.execute('DELETE FROM products');
  await db.client.execute({ sql: 'DELETE FROM app_state WHERE key = ?', args: [repo.SEED_MARKER_KEY] });
  assert.equal(await markerValue(), null);

  await repo.createProduct({
    category: 'jouets',
    name: 'Import manuel',
    name_en: 'Manual import',
    age: '3-5',
    ageLabel: '3-5 ans',
    ageLabel_en: '3-5 years',
    price: 12,
    iconKey: 'camion'
  });
  assert.equal(await repo.countProducts(), 1);

  const result = await repo.seedProductsIfEmpty();
  assert.equal(result.seeded, 0);
  assert.equal(result.reason, 'catalogue-present');
  assert.equal(await repo.countProducts(), 1, 'le catalogue importé ne doit pas être complété');
  assert.ok(await markerValue(), 'le marqueur doit être posé malgré la table non vide');
});

test('supprimer tout le catalogue puis redémarrer ne le ressuscite pas', async () => {
  await db.client.execute('DELETE FROM products');
  assert.equal(await repo.countProducts(), 0);

  const reboot = await repo.seedProductsIfEmpty();
  assert.equal(reboot.seeded, 0, 'aucun produit ne doit être réimporté');
  assert.equal(await repo.countProducts(), 0, 'la boutique doit rester vide');
});
