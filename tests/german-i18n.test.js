/* Tests hors navigateur des parties PURES de l'ajout de l'allemand :
 *   - la chaîne de repli DE -> EN -> FR -> '' de js/script.js ;
 *   - la complétude du dictionnaire allemand ;
 *   - l'extraction JSON tolérante et la décision « ne pas écraser » du script
 *     scripts/translate-de.js.
 * Aucun réseau, aucune base : c'est précisément ce qui doit rester testable
 * sans clé IA.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const script = require('../js/script.js');
const translateDe = require('../scripts/translate-de.js');

/* ===================== DICTIONNAIRE ALLEMAND ===================== */

test('le dictionnaire allemand couvre toutes les clés du français (et de l\'anglais)', () => {
  const fr = Object.keys(script.TRANSLATIONS.fr);
  const en = Object.keys(script.TRANSLATIONS.en);
  const de = Object.keys(script.TRANSLATIONS.de);

  assert.ok(fr.length > 100, 'le dictionnaire de référence doit être conséquent');
  assert.equal(de.length, fr.length);
  for (const key of fr) {
    assert.ok(Object.prototype.hasOwnProperty.call(script.TRANSLATIONS.de, key), `clé allemande manquante : ${key}`);
    assert.equal(typeof script.TRANSLATIONS.de[key], 'string');
    assert.ok(script.TRANSLATIONS.de[key].trim() !== '', `traduction allemande vide : ${key}`);
  }
  // EN et FR avaient déjà exactement les mêmes clés : DE ne doit pas casser ça.
  assert.deepEqual([...fr].sort(), [...en].sort());
});

test('la trotteuse de langue propose bien FR, EN et DE', () => {
  assert.deepEqual(script.LANGUAGES, ['fr', 'en', 'de']);
});

test('translate() sert l\'allemand puis retombe sur le français pour une clé inconnue', () => {
  assert.equal(script.translate('de', 'cart.title'), script.TRANSLATIONS.de['cart.title']);
  assert.equal(script.translate('de', 'tab.description'), script.TRANSLATIONS.de['tab.description']);
  assert.equal(script.translate('de', 'cle.inexistante'), 'cle.inexistante');
});

/* ===================== CHAÎNE DE REPLI ===================== */

test('le repli prend l\'allemand quand il existe', () => {
  const product = { name: 'Camion', name_en: 'Truck', name_de: 'Laster' };
  assert.equal(script.pickLangField(product, 'name', 'de'), 'Laster');
});

test('le repli prend l\'anglais quand l\'allemand est vide', () => {
  const product = { name: 'Camion', name_en: 'Truck' };
  assert.equal(script.pickLangField(product, 'name', 'de'), 'Truck');
  const blankGerman = { name: 'Camion', name_en: 'Truck', name_de: '   ' };
  assert.equal(script.pickLangField(blankGerman, 'name', 'de'), 'Truck');
  const nullGerman = { name: 'Camion', name_en: 'Truck', name_de: null };
  assert.equal(script.pickLangField(nullGerman, 'name', 'de'), 'Truck');
});

test('le repli prend le français quand l\'allemand ET l\'anglais sont vides', () => {
  const product = { name: 'Camion' };
  assert.equal(script.pickLangField(product, 'name', 'de'), 'Camion');
  const product2 = { name: 'Camion', name_en: '' };
  assert.equal(script.pickLangField(product2, 'name', 'de'), 'Camion');
});

test('le repli rend une chaîne vide — jamais undefined, null ou le nom du champ', () => {
  const empty = script.pickLangField({}, 'description', 'de');
  assert.equal(empty, '');
  assert.notEqual(empty, undefined);
  assert.notEqual(empty, null);

  const withNull = script.pickLangField({ description: null, description_en: null }, 'description', 'de');
  assert.equal(withNull, '');
});

test('une grille de tailles allemande vide est ignorée par le repli', () => {
  // js/script.js lit rows[0] : un tableau vide ferait planter le modal.
  const product = {
    sizeGuide: [['Caractéristique', 'Valeur']],
    sizeGuide_en: [['Feature', 'Value']],
    sizeGuide_de: []
  };
  assert.deepEqual(script.pickLangField(product, 'sizeGuide', 'de'), [['Feature', 'Value']]);

  const onlyFrench = { sizeGuide: [['Âge', 'Taille']], sizeGuide_de: [], sizeGuide_en: [] };
  assert.deepEqual(script.pickLangField(onlyFrench, 'sizeGuide', 'de'), [['Âge', 'Taille']]);

  // Aucune grille nulle part : chaîne vide (le rendu a sa propre garde).
  assert.equal(script.pickLangField({ sizeGuide: [] }, 'sizeGuide', 'de'), '');
});

test('la récompense de fidélité suit la langue choisie', () => {
  const tier = { reward: 'FR', reward_en: 'EN', reward_de: 'DE' };
  script.state.lang = 'de';
  assert.equal(script.tierReward(tier), 'DE');
  script.state.lang = 'en';
  assert.equal(script.tierReward(tier), 'EN');
  script.state.lang = 'de';
  assert.equal(script.tierReward({ reward: 'FR', reward_en: 'EN' }), 'EN', 'repli sur l\'anglais');
  assert.equal(script.tierReward({ reward: 'FR' }), 'FR', 'repli final sur le français');
  script.state.lang = 'fr';
});

test('les noms de couleurs sont traduits en allemand', () => {
  script.state.lang = 'de';
  assert.equal(script.colorName('#e8b4a8'), 'Roségold');
  assert.equal(script.colorName('#ffffff'), 'Weiß');
  script.state.lang = 'fr';
});

/* ===================== SCRIPT DE TRADUCTION : JSON TOLÉRANT ===================== */

test('parseJsonFromModel lit une réponse JSON nue', () => {
  assert.deepEqual(translateDe.parseJsonFromModel('{"name_de":"Laster"}'), { name_de: 'Laster' });
});

test('parseJsonFromModel tolère une réponse entourée d\'un bloc markdown', () => {
  const fenced = '```json\n{"name_de":"Laster","sizeGuide_de":[["Alter","Länge"]]}\n```';
  assert.deepEqual(translateDe.parseJsonFromModel(fenced), {
    name_de: 'Laster',
    sizeGuide_de: [['Alter', 'Länge']]
  });
  const bareFence = '```\n{"name_de":"Laster"}\n```';
  assert.deepEqual(translateDe.parseJsonFromModel(bareFence), { name_de: 'Laster' });
});

test('parseJsonFromModel tolère de la prose autour du JSON', () => {
  const raw = 'Voici la traduction demandée :\n{"name_de":"Laster"}\nBonne journée !';
  assert.deepEqual(translateDe.parseJsonFromModel(raw), { name_de: 'Laster' });
});

test('parseJsonFromModel ne se laisse pas piéger par des accolades dans une chaîne', () => {
  const raw = 'blabla {"name_de":"Laster {avec accolade}","care_de":"ok"} fin';
  assert.deepEqual(translateDe.parseJsonFromModel(raw), {
    name_de: 'Laster {avec accolade}',
    care_de: 'ok'
  });
});

test('parseJsonFromModel échoue clairement quand il n\'y a pas de JSON', () => {
  assert.throws(() => translateDe.parseJsonFromModel('aucun json ici'), /JSON/);
  assert.throws(() => translateDe.parseJsonFromModel(''), /JSON/);
  assert.throws(() => translateDe.parseJsonFromModel(null), /JSON/);
});

/* ===================== SCRIPT DE TRADUCTION : DÉCISIONS ===================== */

const FULL_TRANSLATION = {
  name_de: 'Laster',
  ageLabel_de: '0–2 Jahre',
  description_de: 'Beschreibung',
  ecoDetails_de: 'Öko',
  safety_de: 'Sicherheit',
  care_de: 'Pflege',
  sizeGuide_de: [['Alter', 'Größe']]
};

test('un produit entièrement traduit est ignoré (idempotence)', () => {
  assert.deepEqual(translateDe.missingGermanFields(FULL_TRANSLATION), []);
  assert.equal(translateDe.shouldTranslate(FULL_TRANSLATION), false);
});

test('un produit partiellement traduit ne complète que les champs manquants', () => {
  const partial = { ...FULL_TRANSLATION, name_de: '   ', care_de: null };
  assert.deepEqual(translateDe.missingGermanFields(partial).sort(), ['care_de', 'name_de']);
  assert.equal(translateDe.shouldTranslate(partial), true);
});

test('sans --force, un champ allemand déjà rempli n\'est jamais proposé à l\'écriture', () => {
  const fields = translateDe.missingGermanFields(FULL_TRANSLATION, { force: false });
  assert.ok(!fields.includes('name_de'), 'une traduction existante ne doit pas être écrasée');
});

test('--force réécrit tous les champs allemands', () => {
  const fields = translateDe.missingGermanFields(FULL_TRANSLATION, { force: true });
  assert.deepEqual(fields.sort(), [...translateDe.GERMAN_FIELDS].sort());
});

test('germanStateFromRow relit une ligne SQL, grille de tailles comprise', () => {
  const state = translateDe.germanStateFromRow({
    name_de: 'Laster',
    age_label_de: null,
    description_de: '',
    eco_details_de: undefined,
    safety_de: 'Sicherheit',
    care_de: null,
    size_guide_de: JSON.stringify([['Alter', 'Größe']])
  });
  assert.equal(state.name_de, 'Laster');
  assert.equal(state.ageLabel_de, null);
  assert.deepEqual(state.sizeGuide_de, [['Alter', 'Größe']]);
  assert.deepEqual(
    translateDe.missingGermanFields(state).sort(),
    ['ageLabel_de', 'care_de', 'description_de', 'ecoDetails_de']
  );
});

test('germanStateFromRow traite une grille de tailles illisible comme absente', () => {
  const state = translateDe.germanStateFromRow({ size_guide_de: 'pas du json' });
  assert.equal(state.sizeGuide_de, null);
  assert.equal(translateDe.isEmptyTranslation(state.sizeGuide_de), true);
});

/* ===================== SCRIPT DE TRADUCTION : CONFIGURATION ===================== */

test('sans configuration IA, le script échoue avec un message français explicite', () => {
  const config = translateDe.aiConfig({});
  assert.equal(config.ready, false);
  assert.match(config.reason, /AI_BASE_URL/);
  assert.match(config.reason, /AI_API_KEY/);
  assert.match(config.reason, /AI_MODEL/);

  // Une variable présente mais vide ne compte pas comme configurée.
  const half = translateDe.aiConfig({ AI_BASE_URL: 'https://api.exemple/v1', AI_API_KEY: '  ' });
  assert.equal(half.ready, false);
  assert.match(half.reason, /AI_API_KEY/);
});

test('la configuration IA accepte les mêmes variables que megalomarket', () => {
  const config = translateDe.aiConfig({
    AI_BASE_URL: 'https://api.groq.com/openai/v1/',
    AI_API_KEY: 'cle',
    AI_MODEL: 'llama-3.1-8b-instant'
  });
  assert.equal(config.ready, true);
  assert.equal(config.baseUrl, 'https://api.groq.com/openai/v1', 'le slash final est retiré');
  assert.equal(config.model, 'llama-3.1-8b-instant');
});

/* ===================== SCRIPT DE TRADUCTION : ARGUMENTS ===================== */

test('parseArgs lit --limit et --force', () => {
  assert.deepEqual(translateDe.parseArgs([]), { limit: Infinity, force: false, help: false });
  assert.deepEqual(translateDe.parseArgs(['--limit', '5']).limit, 5);
  assert.deepEqual(translateDe.parseArgs(['--limit=3']).limit, 3);
  assert.equal(translateDe.parseArgs(['--force']).force, true);
  assert.throws(() => translateDe.parseArgs(['--limit', '0']), /entier positif/);
  assert.throws(() => translateDe.parseArgs(['--limit']), /entier positif/);
  assert.throws(() => translateDe.parseArgs(['--inconnu']), /Option inconnue/);
});

test('cleanTranslation refuse une réponse inexploitable plutôt que de l\'écrire', () => {
  assert.equal(translateDe.cleanTranslation('name_de', '  Laster  '), 'Laster');
  assert.equal(translateDe.cleanTranslation('name_de', ''), null);
  assert.equal(translateDe.cleanTranslation('name_de', null), null);
  assert.equal(translateDe.cleanTranslation('name_de', 42), null);
  assert.deepEqual(translateDe.cleanTranslation('sizeGuide_de', [['Alter'], ['0–2', '22 cm']]), [['Alter'], ['0–2', '22 cm']]);
  assert.equal(translateDe.cleanTranslation('sizeGuide_de', []), null);
  assert.equal(translateDe.cleanTranslation('sizeGuide_de', 'pas un tableau'), null);
});
