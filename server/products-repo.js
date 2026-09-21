/* Product catalog access layer.
 *
 * The catalog used to live only in products-data.js — a source file read into
 * memory at boot. That made a product impossible to add at runtime, and any
 * write into the repository on Render's ephemeral filesystem would vanish on
 * the next redeploy. Products now live in the database; products-data.js is
 * kept as the seed for a brand-new (empty) database, so the 58 existing
 * products appear unchanged and nothing has to be re-entered by hand.
 *
 * Reading a row back reproduces the exact JSON shape the storefront has always
 * received, including the position of the optional lot / images / imagesByColor
 * fields and the catalog order (sort_order). js/script.js therefore needs no
 * change at all.
 */

const { ICONS, PRODUCTS } = require('./products-data');
const { client } = require('./db');

/* ===================== TAXONOMY (closed lists) =====================
   Category and universe drive the storefront's filters, and iconKey indexes
   the hand-drawn SVG library. All three are closed sets: a value outside them
   would create a product that no filter can reach, or a blank illustration.
   Anything creating a product programmatically (the importer, the AI listing
   generator) must pick from these lists rather than invent a value. */
const CATEGORIES = [
  'jouets', 'vetements', 'destockage', 'electronique',
  'maison', 'beaute', 'sport', 'box', 'bijoux'
];

const UNIVERSES = [
  'bebe', 'collier', 'educatif', 'enfant', 'femme',
  'fille', 'garcon', 'homme', 'plein-air'
];

const ICON_KEYS = Object.keys(ICONS);

/* Existing ids mix a generic "p" (jouets, vetements) with a per-category
   prefix. The prefix is historical and does NOT encode the category reliably,
   so new ids continue whichever sequence the category already uses — computed
   from the ids actually present rather than assumed. */
const CATEGORY_ID_PREFIX = {
  jouets: 'p', vetements: 'p', destockage: 'l', electronique: 'e',
  maison: 'm', beaute: 'b', sport: 's', box: 'bx', bijoux: 'bj'
};

/* Storefront defaults. These are deliberately not empty:
   - js/script.js:798 does rows[0].map(...) on sizeGuide, so an empty array
     throws and the product modal stops opening;
   - js/script.js:757/1348 read colors[0] to pre-select a swatch, and
     POST /api/cart/items rejects a missing color, so an empty colors array
     would make the product impossible to add to the cart.
   Both are enforced below rather than trusted to the caller. */
const DEFAULT_COLORS = ['#ffffff'];
const DEFAULT_BG = '#f2ead6';
const DEFAULT_SIZE_GUIDE = [['Caractéristique', 'Valeur']];
const DEFAULT_SIZE_GUIDE_EN = [['Feature', 'Value']];

/* Text columns that are always emitted as strings. js/script.js injects these
   straight into innerHTML, so a missing value must degrade to '' and never to
   the literal "undefined". */
const TEXT_FIELDS = {
  name: 'name',
  name_en: 'name_en',
  ageLabel: 'age_label',
  ageLabel_en: 'age_label_en',
  description: 'description',
  description_en: 'description_en',
  ecoDetails: 'eco_details',
  ecoDetails_en: 'eco_details_en',
  safety: 'safety',
  safety_en: 'safety_en',
  care: 'care',
  care_en: 'care_en'
};

const COLUMNS = [
  'id', 'category', 'universe', 'age', 'price', 'old_price', 'icon_key', 'bg',
  'colors', 'sale', 'lot', ...Object.values(TEXT_FIELDS),
  'size_guide', 'size_guide_en', 'images', 'images_by_color',
  'source_url', 'supplier_id', 'sort_order'
];

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

/* `lot` is either `true` or the pack size (2, 3, 5 … 200), so it is stored as
   JSON rather than as a boolean flag. */
function encodeLot(value) {
  if (value === null || value === undefined || value === false || value === '') return null;
  if (value === true) return JSON.stringify(true);
  if (Number.isInteger(value) && value > 1) return JSON.stringify(value);
  throw badRequest('lot must be null, true, or an integer greater than 1 (the pack size).');
}

/* ===================== ROW -> API SHAPE =====================
   Field order matters only for readability of the JSON, but it is kept
   identical to the historical output so GET /api/products stays diffable
   against the previous implementation. */
function rowToProduct(row) {
  const product = {
    id: row.id,
    category: row.category,
    universe: row.universe === undefined ? null : row.universe,
    age: row.age,
    price: Number(row.price),
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    icon: ICONS[row.icon_key]
  };
  if (row.images) product.images = JSON.parse(row.images);
  product.bg = row.bg;
  if (row.images_by_color) product.imagesByColor = JSON.parse(row.images_by_color);
  product.colors = JSON.parse(row.colors);
  product.sale = !!Number(row.sale);
  if (row.lot != null) product.lot = JSON.parse(row.lot);

  product.name = row.name;
  product.name_en = row.name_en;
  product.ageLabel = row.age_label;
  product.ageLabel_en = row.age_label_en;
  product.description = row.description;
  product.description_en = row.description_en;
  product.ecoDetails = row.eco_details;
  product.ecoDetails_en = row.eco_details_en;
  product.safety = row.safety;
  product.safety_en = row.safety_en;
  product.care = row.care;
  product.care_en = row.care_en;
  product.sizeGuide = JSON.parse(row.size_guide);
  product.sizeGuide_en = JSON.parse(row.size_guide_en);

  return product;
}

/* ===================== READS ===================== */

async function listProducts() {
  const res = await client.execute(
    `SELECT ${COLUMNS.join(', ')} FROM products ORDER BY sort_order ASC, id ASC`
  );
  return res.rows.map(rowToProduct);
}

async function getProduct(id) {
  if (!id) return null;
  const res = await client.execute({
    sql: `SELECT ${COLUMNS.join(', ')} FROM products WHERE id = ?`,
    args: [String(id)]
  });
  return res.rows.length ? rowToProduct(res.rows[0]) : null;
}

/* One query for a whole cart rather than one per line. Returns a Map keyed by
   id, mirroring the in-memory Map this replaces. Ids that no longer exist are
   simply absent — callers already treat that as a stale reference. */
async function getProductsByIds(ids) {
  const unique = [...new Set((ids || []).filter(Boolean).map(String))];
  if (unique.length === 0) return new Map();

  const placeholders = unique.map(() => '?').join(', ');
  const res = await client.execute({
    sql: `SELECT ${COLUMNS.join(', ')} FROM products WHERE id IN (${placeholders})`,
    args: unique
  });
  return new Map(res.rows.map(row => [row.id, rowToProduct(row)]));
}

async function countProducts() {
  const res = await client.execute('SELECT COUNT(*) AS n FROM products');
  return Number(res.rows[0].n);
}

/* ===================== VALIDATION ===================== */

function validateColors(colors) {
  if (colors === undefined) return DEFAULT_COLORS;
  if (!Array.isArray(colors) || colors.length === 0) {
    throw badRequest('colors must be a non-empty array — an empty list makes the product impossible to add to the cart.');
  }
  for (const color of colors) {
    if (typeof color !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
      throw badRequest(`Invalid color "${color}" — expected a hex value such as #a8e6cf.`);
    }
  }
  return colors;
}

function validateSizeGuide(value, field, fallback) {  if (value === undefined) return fallback;
  if (!Array.isArray(value) || value.length === 0 || !Array.isArray(value[0])) {
    throw badRequest(`${field} must be a non-empty array of rows, the first row being the header — the storefront reads rows[0] and would throw on an empty list.`);
  }
  return value.map(row => {
    if (!Array.isArray(row)) throw badRequest(`${field} rows must be arrays.`);
    return row.map(cell => String(cell));
  });
}

/* Builds the column values for an INSERT/UPDATE from an API payload.
   `partial` omits the required-field checks so PATCH can send one field. */
function normalizeInput(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('A JSON object body is required.');
  }
  const values = {};
  const has = key => Object.prototype.hasOwnProperty.call(input, key);

  const requireField = (key) => {
    if (!partial && (input[key] === undefined || input[key] === null || input[key] === '')) {
      throw badRequest(`"${key}" is required.`);
    }
  };

  if (has('category') || !partial) {
    requireField('category');
    if (has('category')) {
      if (!CATEGORIES.includes(input.category)) {
        throw badRequest(`Unknown category "${input.category}". Allowed: ${CATEGORIES.join(', ')}.`);
      }
      values.category = input.category;
    }
  }

  if (has('universe')) {
    if (input.universe === null || input.universe === '') {
      values.universe = null;
    } else if (!UNIVERSES.includes(input.universe)) {
      throw badRequest(`Unknown universe "${input.universe}". Allowed: ${UNIVERSES.join(', ')}.`);
    } else {
      values.universe = input.universe;
    }
  } else if (!partial) {
    values.universe = null;
  }

  requireField('age');
  if (has('age')) values.age = String(input.age);

  // Mapped through TEXT_FIELDS: the API speaks camelCase (ageLabel) while the
  // columns are snake_case (age_label), and using the payload name directly
  // here would target a column that does not exist.
  for (const field of ['name', 'name_en', 'ageLabel', 'ageLabel_en']) {
    requireField(field);
    if (has(field)) values[TEXT_FIELDS[field]] = String(input[field]);
  }

  if (has('price') || !partial) {
    requireField('price');
    if (has('price')) {
      if (!Number.isFinite(input.price) || input.price <= 0) {
        throw badRequest('price must be a positive number.');
      }
      values.price = input.price;
    }
  }

  if (has('oldPrice')) {
    if (input.oldPrice === null) {
      values.old_price = null;
    } else if (!Number.isFinite(input.oldPrice) || input.oldPrice <= 0) {
      throw badRequest('oldPrice must be null or a positive number.');
    } else {
      values.old_price = input.oldPrice;
    }
  } else if (!partial) {
    values.old_price = null;
  }

  if (has('sale') || !partial) {
    values.sale = has('sale') ? (input.sale ? 1 : 0) : 0;
  }

  if (has('lot')) {
    values.lot = encodeLot(input.lot);
  } else if (!partial) {
    values.lot = null;
  }

  /* Only a library KEY is accepted, never a raw SVG string: the key is
     whitelisted here, and js/script.js injects the resolved icon through
     innerHTML — so accepting arbitrary markup would be a stored-XSS hole. */
  if (has('iconKey') || has('icon') || !partial) {
    const key = has('iconKey') ? input.iconKey : input.icon;
    if (!key) throw badRequest(`"iconKey" is required. Allowed values: ${ICON_KEYS.join(', ')}.`);
    if (!ICON_KEYS.includes(key)) {
      throw badRequest(`Unknown iconKey "${key}". Allowed values: ${ICON_KEYS.join(', ')}.`);
    }
    values.icon_key = key;
  }

  if (has('colors') || !partial) {
    values.colors = JSON.stringify(validateColors(input.colors));
  }
  if (has('bg') || !partial) {
    values.bg = has('bg') ? String(input.bg) : DEFAULT_BG;
  }
  if (has('sizeGuide') || !partial) {
    values.size_guide = JSON.stringify(validateSizeGuide(input.sizeGuide, 'sizeGuide', DEFAULT_SIZE_GUIDE));
  }
  if (has('sizeGuide_en') || !partial) {
    values.size_guide_en = JSON.stringify(validateSizeGuide(input.sizeGuide_en, 'sizeGuide_en', DEFAULT_SIZE_GUIDE_EN));
  }

  for (const [field, column] of Object.entries(TEXT_FIELDS)) {
    if (field === 'name' || field === 'name_en' || field === 'ageLabel' || field === 'ageLabel_en') continue;
    if (has(field)) values[column] = String(input[field]);
    else if (!partial) values[column] = '';
  }

  for (const field of ['images', 'imagesByColor']) {
    if (!has(field)) {
      if (!partial) values[field === 'images' ? 'images' : 'images_by_color'] = null;
      continue;
    }
    const payload = input[field];
    if (payload === null) {
      values[field === 'images' ? 'images' : 'images_by_color'] = null;
      continue;
    }
    if (typeof payload !== 'object') throw badRequest(`${field} must be an array, an object or null.`);
    values[field === 'images' ? 'images' : 'images_by_color'] = JSON.stringify(payload);
  }

  if (has('sourceUrl')) values.source_url = input.sourceUrl ? String(input.sourceUrl) : null;
  else if (!partial) values.source_url = null;

  if (has('supplierId')) values.supplier_id = input.supplierId == null ? null : Number(input.supplierId);
  else if (!partial) values.supplier_id = null;

  return values;
}

/* ===================== WRITES ===================== */

/* New ids continue the sequence already used by the category's prefix.
   jouets and vetements share the "p" prefix, so the max is taken across all
   ids carrying that prefix — which also guarantees no collision. */
async function nextProductId(category) {
  const prefix = CATEGORY_ID_PREFIX[category];
  const res = await client.execute('SELECT id FROM products');
  let max = 0;
  for (const row of res.rows) {
    const match = /^([a-z]+)(\d+)$/.exec(String(row.id));
    if (match && match[1] === prefix) max = Math.max(max, Number(match[2]));
  }
  return `${prefix}${max + 1}`;
}

async function insertProduct(values) {
  const columns = Object.keys(values);
  const res = await client.execute({
    sql: `INSERT INTO products (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    args: columns.map(column => values[column])
  });
  return res;
}

async function createProduct(input) {
  const values = normalizeInput(input, { partial: false });
  values.id = input.id ? String(input.id) : await nextProductId(values.category);
  values.sort_order = Number.isInteger(input.sortOrder)
    ? input.sortOrder
    : (await client.execute('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM products')).rows[0].next;

  const existing = await getProduct(values.id);
  if (existing) throw badRequest(`Product id "${values.id}" already exists.`);
  if (input.sourceUrl) {
    const duplicate = await client.execute({
      sql: 'SELECT id FROM products WHERE source_url = ?',
      args: [String(input.sourceUrl)]
    });
    if (duplicate.rows.length) {
      throw badRequest(`A product already exists for this source URL (id ${duplicate.rows[0].id}).`);
    }
  }

  await insertProduct(values);
  return getProduct(values.id);
}

async function updateProduct(id, patch) {
  const existing = await getProduct(id);
  if (!existing) return null;

  const values = normalizeInput(patch, { partial: true });
  if (Object.keys(values).length === 0) throw badRequest('No updatable field was provided.');

  const columns = Object.keys(values);
  await client.execute({
    sql: `UPDATE products SET ${columns.map(column => `${column} = ?`).join(', ')} WHERE id = ?`,
    args: [...columns.map(column => values[column]), String(id)]
  });
  return getProduct(id);
}

async function deleteProduct(id) {
  const res = await client.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [String(id)] });
  return Number(res.rowsAffected) > 0;
}

/* ===================== SEED =====================
   Runs once, on a database that has never held a product. The in-memory
   catalog is imported as-is so the live site is unchanged by the migration,
   icon strings included (reverse-mapped back to their library key, which is
   what the row stores). */
async function seedProductsIfEmpty() {
  if (await countProducts() > 0) return { seeded: 0 };

  const iconKeyBySvg = new Map(Object.entries(ICONS).map(([key, svg]) => [svg, key]));
  const now = new Date().toISOString();

  for (const [index, product] of PRODUCTS.entries()) {
    const iconKey = iconKeyBySvg.get(product.icon);
    if (!iconKey) {
      throw new Error(`Cannot seed product ${product.id}: its icon is not in the ICONS library.`);
    }
    if (!CATEGORIES.includes(product.category)) {
      throw new Error(`Cannot seed product ${product.id}: unknown category "${product.category}".`);
    }

    await insertProduct({
      id: product.id,
      category: product.category,
      universe: product.universe ?? null,
      age: product.age,
      price: product.price,
      old_price: product.oldPrice,
      icon_key: iconKey,
      bg: product.bg,
      colors: JSON.stringify(product.colors),
      sale: product.sale ? 1 : 0,
      lot: 'lot' in product ? JSON.stringify(product.lot) : null,
      name: product.name,
      name_en: product.name_en,
      age_label: product.ageLabel,
      age_label_en: product.ageLabel_en,
      description: product.description,
      description_en: product.description_en,
      eco_details: product.ecoDetails,
      eco_details_en: product.ecoDetails_en,
      safety: product.safety,
      safety_en: product.safety_en,
      care: product.care,
      care_en: product.care_en,
      size_guide: JSON.stringify(product.sizeGuide),
      size_guide_en: JSON.stringify(product.sizeGuide_en),
      images: product.images ? JSON.stringify(product.images) : null,
      images_by_color: product.imagesByColor ? JSON.stringify(product.imagesByColor) : null,
      source_url: null,
      supplier_id: null,
      sort_order: index
    });
  }

  return { seeded: PRODUCTS.length, at: now };
}

module.exports = {
  CATEGORIES,
  UNIVERSES,
  ICON_KEYS,
  rowToProduct,
  listProducts,
  getProduct,
  getProductsByIds,
  countProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProductsIfEmpty
};
