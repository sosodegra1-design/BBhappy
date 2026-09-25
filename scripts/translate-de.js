#!/usr/bin/env node
/* Traduction du catalogue BBVOLTEX vers l'allemand.
 *
 * À QUOI ÇA SERT
 * Les 58 produits existants n'ont pas de champs allemands : la page DE doit
 * donc les afficher en anglais (repli), ce qui n'est pas une vraie traduction.
 * Ce script remplit `name_de`, `age_label_de`, `description_de`,
 * `eco_details_de`, `safety_de`, `care_de` et `size_guide_de` en base, produit
 * par produit, via n'importe quelle API compatible OpenAI.
 *
 * POURQUOI UN SCRIPT ET PAS UNE TRADUCTION EN DUR
 * Les textes produits doivent venir d'un modèle, pas d'une invention dans le
 * code : ce script est donc la SEULE source des traductions allemandes, et il
 * refuse d'écraser une traduction déjà présente sans `--force`.
 *
 * UTILISATION (lancer depuis la racine du projet)
 *   AI_BASE_URL=... AI_API_KEY=... AI_MODEL=... npm run translate:de
 *   ... npm run translate:de -- --limit 5        # petit lot de contrôle
 *   ... npm run translate:de -- --force          # réécrit tout
 *
 * COÛT : UN appel IA par produit restant à traduire (58 au maximum). Le script
 * est idempotent : relancé, il ne retraduit que ce qui manque encore.
 *
 * Variables d'environnement (mêmes noms que le projet voisin megalomarket) :
 *   AI_BASE_URL  base de l'API, sans « /chat/completions »
 *   AI_API_KEY   clé du fournisseur
 *   AI_MODEL     nom exact du modèle (obligatoire, aucun défaut possible)
 */

'use strict';

/* Champs allemands par produit. Les six premiers sont du texte, le dernier est
   un tableau de lignes (même forme que sizeGuide / sizeGuide_en). La colonne
   SQL est rappelée car l'API parle camelCase (ageLabel_de) et la base
   snake_case (age_label_de). */
const GERMAN_TEXT_FIELDS = ['name_de', 'ageLabel_de', 'description_de', 'ecoDetails_de', 'safety_de', 'care_de'];
const GERMAN_ARRAY_FIELDS = ['sizeGuide_de'];
const GERMAN_FIELDS = [...GERMAN_TEXT_FIELDS, ...GERMAN_ARRAY_FIELDS];
const GERMAN_COLUMNS = {
  name_de: 'name_de',
  ageLabel_de: 'age_label_de',
  description_de: 'description_de',
  ecoDetails_de: 'eco_details_de',
  safety_de: 'safety_de',
  care_de: 'care_de',
  sizeGuide_de: 'size_guide_de'
};

/* ===================== JSON TOLÉRANT =====================
   Les modèles enveloppent régulièrement leur réponse dans un bloc markdown
   (```json … ```) ou ajoutent une phrase autour. Un JSON.parse brut échoue
   alors que la réponse est exploitable. On isole donc le premier objet/tableau
   équilibré, en ignorant les accolades situées dans une chaîne (une
   description contenant « { » casserait un simple comptage de caractères).
   Réimplémenté ici volontairement : megalomarket n'est pas importable depuis
   ce projet (deux paquets séparés). */
function extractBalanced(text, start) {
  const open = text[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseJsonFromModel(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Réponse IA non exploitable (JSON invalide) : réponse vide.');
  }

  // Cas nominal : le modèle a obéi.
  try {
    return JSON.parse(raw);
  } catch {
    // Réponse emballée : on tente les stratégies ci-dessous.
  }

  const fencePattern = /```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/g;
  let fence;
  while ((fence = fencePattern.exec(raw)) !== null) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // Bloc inexploitable : on essaie le suivant.
    }
  }

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    if (char !== '{' && char !== '[') continue;
    const candidate = extractBalanced(raw, i);
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Candidat invalide : on cherche le suivant.
    }
  }

  throw new Error(`Réponse IA non exploitable (JSON invalide) : ${raw.slice(0, 200)}`);
}

/* ===================== CONFIGURATION IA ===================== */
function aiConfig(env = process.env) {
  const missing = ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL']
    .filter(name => !env[name] || String(env[name]).trim() === '');
  if (missing.length) {
    return {
      ready: false,
      reason:
        `Fournisseur IA non configuré : ${missing.join(', ')} manque(nt). ` +
        'Renseigne AI_BASE_URL (base de l\'API, sans /chat/completions), ' +
        'AI_API_KEY et AI_MODEL, puis relance le script.'
    };
  }
  return {
    ready: true,
    // Une base terminée par un slash produirait « //chat/completions ».
    baseUrl: String(env.AI_BASE_URL).replace(/\/+$/, ''),
    apiKey: env.AI_API_KEY,
    model: env.AI_MODEL
  };
}

/* ===================== ARGUMENTS ===================== */
function parseArgs(argv) {
  const options = { limit: Infinity, force: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--limit' || arg.startsWith('--limit=')) {
      const raw = arg === '--limit' ? argv[++i] : arg.slice('--limit='.length);
      const value = Number(raw);
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(`--limit attend un entier positif (reçu : ${raw}).`);
      }
      options.limit = value;
    } else {
      throw new Error(`Option inconnue : ${arg}. Utilise --limit N, --force ou --help.`);
    }
  }
  return options;
}

/* ===================== DÉCISIONS PURES =====================
   Testables sans réseau ni base (tests/german-i18n.test.js). */

function isEmptyTranslation(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/* Construit l'état allemand d'une ligne SQL telle que la lit le script. */
function germanStateFromRow(row) {
  const state = {};
  for (const field of GERMAN_FIELDS) {
    const raw = row[GERMAN_COLUMNS[field]];
    if (GERMAN_ARRAY_FIELDS.includes(field)) {
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }
      state[field] = Array.isArray(parsed) ? parsed : null;
    } else {
      state[field] = raw === undefined ? null : raw;
    }
  }
  return state;
}

/* Les champs réellement absents. Sans --force, un champ déjà rempli n'est
   JAMAIS proposé à l'écriture : une traduction existante est donc protégée,
   même si le produit n'est que partiellement traduit. */
function missingGermanFields(state, { force = false } = {}) {
  return GERMAN_FIELDS.filter(field => force || isEmptyTranslation(state[field]));
}

function shouldTranslate(state, options = {}) {
  return missingGermanFields(state, options).length > 0;
}

/* ===================== PROMPT ===================== */
const SYSTEM_PROMPT =
  'Tu es un traducteur professionnel spécialisé dans le e-commerce. ' +
  'Tu traduis du français et de l\'anglais vers un allemand naturel (de-DE), ' +
  'avec le vouvoiement (Sie) pour les textes adressés au client. ' +
  'Tu ne traduis jamais les noms de marque (BBVOLTEX), les unités (cm, kg, €) ' +
  'ni les codes de réduction (SOLEIL). Tu réponds UNIQUEMENT par un objet ' +
  'JSON valide, sans texte avant ni après, sans bloc markdown.';

function buildPrompt(row, fields) {
  const source = {
    name: row.name,
    name_en: row.name_en,
    ageLabel: row.age_label,
    ageLabel_en: row.age_label_en,
    description: row.description,
    description_en: row.description_en,
    ecoDetails: row.eco_details,
    ecoDetails_en: row.eco_details_en,
    safety: row.safety,
    safety_en: row.safety_en,
    care: row.care,
    care_en: row.care_en,
    sizeGuide: safeParse(row.size_guide),
    sizeGuide_en: safeParse(row.size_guide_en)
  };

  return [
    `Fiche produit « ${row.id} » (catégorie ${row.category}).`,
    `Traduis uniquement ces clés en allemand : ${fields.join(', ')}.`,
    'Contraintes de forme :',
    '- name_de, ageLabel_de, description_de, ecoDetails_de, safety_de, care_de : des chaînes de caractères.',
    '- sizeGuide_de : un tableau de lignes, chaque ligne étant un tableau de cellules texte, exactement comme sizeGuide_en.',
    'Réponds par un objet JSON contenant exactement les clés demandées.',
    `Sources : ${JSON.stringify(source)}`
  ].join('\n');
}

function safeParse(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

/* ===================== APPEL IA ===================== */
const AI_TIMEOUT_MS = 60000;

async function askGerman(config, prompt, fetchImpl = fetch) {
  let response;
  try {
    response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });
  } catch (error) {
    if (error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new Error(`Fournisseur IA injoignable (${config.baseUrl}) : aucune réponse en ${AI_TIMEOUT_MS / 1000} s.`);
    }
    throw new Error(`Impossible de contacter le fournisseur IA (${config.baseUrl}) : ${error && error.message ? error.message : error}`);
  }

  if (!response.ok) {
    // Le corps est rendu tel quel : le fournisseur y met la cause exacte
    // (quota, modèle inconnu, clé révoquée), la masquer rendrait le problème
    // réparable opaque.
    const detail = await response.text().catch(() => '');
    throw new Error(`Erreur du fournisseur IA (HTTP ${response.status}) : ${detail.slice(0, 300)}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Réponse IA illisible : le fournisseur n\'a pas renvoyé du JSON.');
  }
  const content = payload && payload.choices && payload.choices[0] && payload.choices[0].message
    ? payload.choices[0].message.content
    : null;
  if (typeof content !== 'string') {
    throw new Error('Réponse IA inattendue : choices[0].message.content est absent.');
  }
  return content;
}

/* ===================== NETTOYAGE DE LA RÉPONSE ===================== */
/* Ne conserve que ce qui est exploitable : une chaîne non vide, ou un tableau
   de lignes non vide dont chaque ligne est un tableau. Une valeur douteuse est
   ignorée plutôt qu'écrite telle quelle dans la boutique. */
function cleanTranslation(field, value) {
  if (GERMAN_ARRAY_FIELDS.includes(field)) {
    if (!Array.isArray(value) || value.length === 0 || !Array.isArray(value[0])) return null;
    return value.map(row => (Array.isArray(row) ? row.map(cell => String(cell)) : null))
      .filter(row => row !== null);
  }
  if (typeof value !== 'string' || value.trim() === '') return null;
  return value.trim();
}

/* ===================== PROGRAMME PRINCIPAL ===================== */
async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log('Usage : node scripts/translate-de.js [--limit N] [--force]');
    console.log('  --limit N  ne traduit que les N premiers produits incomplets');
    console.log('  --force    réécrit aussi les traductions allemandes existantes');
    return;
  }

  const config = aiConfig();
  if (!config.ready) {
    console.error(`❌ ${config.reason}`);
    process.exitCode = 1;
    return;
  }

  // Requis paresseusement : les parties pures ci-dessus restent testables sans
  // ouvrir de base de données.
  const db = require('../server/db');
  // Ajoute les colonnes allemandes si la base est antérieure à leur ajout —
  // indispensable pour travailler sur la base de production existante.
  await db.init();

  const result = await db.client.execute('SELECT * FROM products ORDER BY sort_order ASC, id ASC');
  const pending = result.rows.filter(row => shouldTranslate(germanStateFromRow(row), options));
  const batch = pending.slice(0, options.limit);

  console.log(`Catalogue : ${result.rows.length} produit(s), ${pending.length} à compléter.`);
  if (options.limit !== Infinity) console.log(`Limite demandée : ${batch.length} produit(s) dans ce lot.`);
  if (batch.length === 0) {
    console.log('✅ Rien à traduire : tous les produits demandés ont déjà leur version allemande.');
    return;
  }

  let done = 0;
  let failed = 0;
  for (const row of batch) {
    const state = germanStateFromRow(row);
    const fields = missingGermanFields(state, options);
    console.log(`→ ${row.id} « ${row.name} » : ${fields.join(', ')}…`);
    try {
      const parsed = parseJsonFromModel(await askGerman(config, buildPrompt(row, fields)));
      const values = {};
      for (const field of fields) {
        const cleaned = cleanTranslation(field, parsed[field]);
        if (cleaned === null) continue;
        values[GERMAN_COLUMNS[field]] = GERMAN_ARRAY_FIELDS.includes(field) ? JSON.stringify(cleaned) : cleaned;
      }
      const columns = Object.keys(values);
      if (columns.length === 0) {
        console.log(`   ⚠️  ${row.id} : aucune traduction exploitable dans la réponse, produit ignoré.`);
        failed += 1;
        continue;
      }
      await db.client.execute({
        sql: `UPDATE products SET ${columns.map(column => `${column} = ?`).join(', ')} WHERE id = ?`,
        args: [...columns.map(column => values[column]), row.id]
      });
      console.log(`   ✅ ${row.id} : ${columns.length} champ(s) enregistré(s).`);
      done += 1;
    } catch (error) {
      failed += 1;
      console.error(`   ❌ ${row.id} : ${error.message}`);
    }
  }

  console.log(`\nTerminé : ${done} produit(s) traduit(s), ${failed} échec(s).`);
  if (failed > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch(error => {
    console.error(`❌ ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  GERMAN_FIELDS,
  GERMAN_COLUMNS,
  extractBalanced,
  parseJsonFromModel,
  aiConfig,
  parseArgs,
  isEmptyTranslation,
  germanStateFromRow,
  missingGermanFields,
  shouldTranslate,
  buildPrompt,
  cleanTranslation
};
