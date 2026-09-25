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

    /* Product catalog. Previously held only in products-data.js (a source
       file read into memory at boot), which made products impossible to add
       at runtime and unsafe to write to on Render's ephemeral filesystem.
       icon_key indexes the hand-drawn SVG library in products-data.js rather
       than storing markup, so a row can never introduce arbitrary HTML into
       the storefront (the icon is injected via innerHTML). */
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'fournisseur',
      margin_coefficient REAL,
      status TEXT NOT NULL DEFAULT 'actif',
      url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
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
      /* JSON-encoded, not a flag: lot is either true or the pack size
         (2, 3, 5 ... 200), and collapsing it to a boolean would silently lose
         the quantity the storefront badge is describing. */
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
      /* L'allemand est la troisième langue de la vitrine, ajoutée APRÈS que le
         catalogue soit passé en base. Ces colonnes sont volontairement
         nullables et sans valeur par défaut : « pas encore traduit » est un
         état normal (la vitrine retombe alors sur l'anglais puis le français),
         et SQLite refuse d'ajouter une colonne NOT NULL sans défaut à une table
         qui contient déjà des lignes — ce qui est exactement le cas des ~59
         produits réels. */
      name_de TEXT,
      age_label_de TEXT,
      description_de TEXT,
      eco_details_de TEXT,
      safety_de TEXT,
      care_de TEXT,
      size_guide_de TEXT,
      images TEXT,
      images_by_color TEXT,
      source_url TEXT,
      supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_sort ON products (sort_order);
    CREATE INDEX IF NOT EXISTS idx_products_source_url ON products (source_url);
    CREATE INDEX IF NOT EXISTS idx_products_supplier ON products (supplier_id);

    CREATE TABLE IF NOT EXISTS physical_card_requests (
      cart_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      zip TEXT NOT NULL,
      city TEXT NOT NULL,
      requested_at TEXT NOT NULL
    );

    /* Faits durables concernant la base elle-même, et non un visiteur. Premier
       usage : le marqueur « le catalogue historique a déjà été importé », qui
       empêche un déploiement de ressusciter des produits supprimés
       volontairement (voir seedProductsIfEmpty dans products-repo.js). Une
       table clé/valeur plutôt qu'une colonne dédiée : tout futur drapeau
       « une seule fois » (import déjà fait, migration déjà appliquée) a besoin
       exactement du même stockage, et une nouvelle ligne coûte moins cher et
       risque moins qu'un ALTER TABLE de plus. */
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration for databases created before Stripe support was added: the
  // CREATE TABLE above only applies to brand-new tables, so existing
  // deployments need the column added explicitly. Safe to run every startup.
  // SQLite rejects UNIQUE on ALTER TABLE ADD COLUMN, so the constraint is
  // added afterwards as a separate unique index instead.
  try {
    await client.execute('ALTER TABLE orders ADD COLUMN stripe_session_id TEXT');
  } catch (err) {
    if (!/duplicate column name/i.test(err.message)) throw err;
  }
  await client.execute(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders (stripe_session_id)'
  );

  /* Real order lifecycle (shipping, delivery, returns), added for the
     automated post-purchase emails. Before this, /api/track derived a
     "shipped"/"delivered" status from elapsed time alone — a fake, ALWAYS-
     PROGRESSING clock with no relationship to what actually happened to the
     parcel. These columns hold the real thing: a status only advances when
     the seller (via Megalomarket, after a genuine carrier shipment) or a
     genuine carrier webhook says so. `status` starts at 'confirmed' for every
     existing row — that much is true for all of them, since they only exist
     because payment was confirmed. */
  const orderColumns = [
    ['status', "TEXT NOT NULL DEFAULT 'confirmed'"],
    ['carrier', 'TEXT'],
    ['tracking_number', 'TEXT'],
    ['tracking_url', 'TEXT'],
    ['label_url', 'TEXT'],
    ['shipped_at', 'TEXT'],
    ['delivered_at', 'TEXT'],
    // return_status: NULL (no return), 'requested', 'label_sent', 'resolved'.
    ['return_status', 'TEXT'],
    ['return_reason', 'TEXT'],
    ['return_requested_at', 'TEXT'],
    ['return_label_url', 'TEXT'],
    ['return_handled_at', 'TEXT']
  ];
  for (const [name, definition] of orderColumns) {
    try {
      await client.execute(`ALTER TABLE orders ADD COLUMN ${name} ${definition}`);
    } catch (err) {
      if (!/duplicate column name/i.test(err.message)) throw err;
    }
  }

  /* Order lines recorded the product id and price but not the name, so the
     name was looked up live from the catalog. Once a product can be deleted,
     that lookup fails and every past order — confirmation screen and customer
     tracking page included — would show a raw id such as "bj1" instead of
     "Collier personnalisé". The name is now snapshotted on the line, and the
     live lookup is only a fallback for rows written before this column
     existed. */
  try {
    await client.execute('ALTER TABLE order_items ADD COLUMN name TEXT');
  } catch (err) {
    if (!/duplicate column name/i.test(err.message)) throw err;
  }

  /* L'allemand a été ajouté comme troisième langue après la migration du
     catalogue en base. Le CREATE TABLE ci-dessus ne s'applique qu'à une table
     neuve : une base existante (la production en contient ~59 produits réels)
     a donc besoin d'un ALTER explicite. Deux choix délibérés :
       - colonnes nullables et SANS défaut, parce que SQLite refuse d'ajouter
         une colonne NOT NULL sans défaut à une table déjà remplie, et parce
         que « pas encore traduit » est un état légitime ;
       - un ALTER par colonne dans un try/catch qui n'ignore QUE
         « duplicate column name », donc rejouable à chaque démarrage sans
         risque, tout en laissant remonter une vraie erreur (faute de frappe,
         droits, disque).
     Rien n'est renommé, supprimé ni réécrit : aucune ligne produit n'est
     touchée, donc ids, prix et historique de commandes sont intacts. */
  const GERMAN_PRODUCT_COLUMNS = [
    'name_de', 'age_label_de', 'description_de', 'eco_details_de',
    'safety_de', 'care_de', 'size_guide_de'
  ];
  for (const column of GERMAN_PRODUCT_COLUMNS) {
    try {
      // Les noms de colonnes viennent de la liste codée en dur ci-dessus,
      // jamais d'une entrée utilisateur.
      await client.execute(`ALTER TABLE products ADD COLUMN ${column} TEXT`);
    } catch (err) {
      if (!/duplicate column name/i.test(err.message)) throw err;
    }
  }
}

module.exports = { client, init };
