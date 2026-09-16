// Auto-extracted from js/script.js — single source of truth for the product catalog,
// served to the client via GET /api/products so the browser never hardcodes it.

const ICONS = {
  camion: `<svg viewBox="0 0 100 100"><rect x="8" y="45" width="55" height="28" rx="6" fill="#fff"/><path d="M63 50h18l10 14v9H63z" fill="#fff" opacity=".85"/><rect x="70" y="55" width="10" height="8" fill="#4a4358" opacity=".3"/><circle cx="26" cy="76" r="9" fill="#4a4358"/><circle cx="26" cy="76" r="4" fill="#fff"/><circle cx="68" cy="76" r="9" fill="#4a4358"/><circle cx="68" cy="76" r="4" fill="#fff"/></svg>`,
  peluche: `<svg viewBox="0 0 100 100"><circle cx="30" cy="24" r="10" fill="#fff"/><circle cx="70" cy="24" r="10" fill="#fff"/><circle cx="50" cy="38" r="26" fill="#fff"/><ellipse cx="50" cy="72" rx="30" ry="24" fill="#fff"/><circle cx="42" cy="34" r="3" fill="#4a4358"/><circle cx="58" cy="34" r="3" fill="#4a4358"/><circle cx="50" cy="44" r="4" fill="#4a4358"/></svg>`,
  body: `<svg viewBox="0 0 100 100"><path d="M35 10h30l4 14h12l6 20-14 6v40a6 6 0 0 1-6 6H33a6 6 0 0 1-6-6V50l-14-6 6-20h12z" fill="#fff"/><circle cx="50" cy="28" r="4" fill="#4a4358" opacity=".3"/></svg>`,
  cire: `<svg viewBox="0 0 100 100"><path d="M50 8c-12 0-20 8-20 18v6l-18 8 6 14 12-5v41a6 6 0 0 0 6 6h28a6 6 0 0 0 6-6V49l12 5 6-14-18-8v-6c0-10-8-18-20-18z" fill="#fff"/><circle cx="50" cy="26" r="8" fill="none" stroke="#4a4358" stroke-width="2" opacity=".3"/></svg>`,
  puzzle: `<svg viewBox="0 0 100 100"><path d="M12 12h30v10a6 6 0 1 1 0 12v14H12V12z" fill="#fff"/><path d="M50 12h38v36H62V34a6 6 0 1 0 0-12V12z" fill="#fff" opacity=".85"/><path d="M12 50h30v12a6 6 0 1 1 0 12v14H12V50z" fill="#fff" opacity=".7"/><path d="M50 50h38v38H50V64a6 6 0 1 1 0-12V50z" fill="#fff" opacity=".55"/></svg>`,
  cerfvolant: `<svg viewBox="0 0 100 100"><path d="M50 6 78 46 50 94 22 46z" fill="#fff"/><line x1="50" y1="6" x2="50" y2="94" stroke="#4a4358" stroke-width="2" opacity=".25"/><line x1="22" y1="46" x2="78" y2="46" stroke="#4a4358" stroke-width="2" opacity=".25"/><path d="M50 94c0 0 -4 8 2 10c-6 2 -2 10 4 8" stroke="#fff" stroke-width="3" fill="none"/></svg>`,
  baskets: `<svg viewBox="0 0 100 100"><path d="M10 70c0-6 6-10 14-12l20-14 10 6 20-4 12 8c6 2 8 6 8 12v6a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z" fill="#fff"/><path d="M44 44l10 6-4 8-14-6z" fill="#fff" opacity=".6"/></svg>`,
  robot: `<svg viewBox="0 0 100 100"><rect x="30" y="10" width="40" height="6" fill="#fff"/><rect x="26" y="16" width="48" height="34" rx="8" fill="#fff"/><circle cx="40" cy="32" r="5" fill="#4a4358" opacity=".3"/><circle cx="60" cy="32" r="5" fill="#4a4358" opacity=".3"/><rect x="18" y="54" width="64" height="34" rx="10" fill="#fff" opacity=".85"/><rect x="4" y="58" width="12" height="22" rx="6" fill="#fff" opacity=".7"/><rect x="84" y="58" width="12" height="22" rx="6" fill="#fff" opacity=".7"/></svg>`,
  pull: `<svg viewBox="0 0 100 100"><path d="M32 12 18 26l8 12 8-6v52a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V32l8 6 8-12-14-14-8 6H40z" fill="#fff"/><line x1="30" y1="50" x2="70" y2="50" stroke="#4a4358" stroke-width="2" opacity=".2"/><line x1="30" y1="62" x2="70" y2="62" stroke="#4a4358" stroke-width="2" opacity=".2"/></svg>`,
  trottinette: `<svg viewBox="0 0 100 100"><line x1="24" y1="10" x2="24" y2="60" stroke="#fff" stroke-width="6" stroke-linecap="round"/><line x1="12" y1="14" x2="36" y2="14" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M24 60 78 66" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="24" cy="80" r="9" fill="#fff"/><circle cx="78" cy="72" r="9" fill="#fff"/></svg>`,
  lapin: `<svg viewBox="0 0 100 100"><ellipse cx="38" cy="20" rx="7" ry="18" fill="#fff"/><ellipse cx="60" cy="20" rx="7" ry="18" fill="#fff"/><circle cx="50" cy="46" r="24" fill="#fff"/><ellipse cx="50" cy="80" rx="26" ry="18" fill="#fff"/><circle cx="43" cy="42" r="3" fill="#4a4358" opacity=".3"/><circle cx="57" cy="42" r="3" fill="#4a4358" opacity=".3"/></svg>`,
  legging: `<svg viewBox="0 0 100 100"><path d="M30 8h40l4 30-4 54h-14l-6-40-6 40H30l-4-54z" fill="#fff"/><line x1="35" y1="20" x2="65" y2="20" stroke="#4a4358" stroke-width="2" opacity=".2"/></svg>`
};
// Icons are purely decorative (the product name already conveys the product); hide them from assistive tech.
Object.keys(ICONS).forEach(key => {
  ICONS[key] = ICONS[key].replace('<svg viewBox="0 0 100 100">', '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">');
});

/* Human-readable names for the swatch colors used across the catalog (for screen readers). */
const COLOR_NAMES = {
  '#a8e6cf': { fr: 'Vert menthe', en: 'Mint green' },
  '#ffcab1': { fr: 'Pêche', en: 'Peach' },
  '#ffe066': { fr: 'Jaune soleil', en: 'Sun yellow' },
  '#ffffff': { fr: 'Blanc', en: 'White' }
};
function colorName(hex) {
  const entry = COLOR_NAMES[hex.toLowerCase()];
  if (!entry) return hex;
  return state.lang === 'en' ? entry.en : entry.fr;
}

/* ===================== DATA ===================== */
const PRODUCTS = [
  {
    id: 'p1', category: 'jouets', universe: 'educatif', age: '0-2',
    price: 29.9, oldPrice: null, icon: ICONS.camion, bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066', '#ffcab1'], sale: false,
    name: 'Camion en bois éducatif', name_en: 'Educational Wooden Truck',
    ageLabel: '0-2 ans', ageLabel_en: '0-2 years',
    description: 'Camion en bois de hêtre massif, poncé et verni à l\'eau pour une prise en main tout en douceur. Conçu pour stimuler la motricité fine et l\'imagination dès le plus jeune âge.',
    description_en: 'Solid beech wood truck, sanded and water-varnished for a gentle grip. Designed to boost fine motor skills and imagination from an early age.',
    ecoDetails: 'Bois issu de forêts gérées durablement (certification FSC), peintures à base d\'eau non toxiques, zéro plastique dans l\'emballage.',
    ecoDetails_en: 'Wood from sustainably managed forests (FSC certified), non-toxic water-based paints, zero plastic packaging.',
    safety: 'Conforme à la norme européenne de sécurité des jouets CE EN71. Pièces arrondies, sans petites pièces détachables.',
    safety_en: 'Complies with European toy safety standard CE EN71. Rounded parts, no small detachable pieces.',
    care: 'Nettoyer avec un chiffon légèrement humide. Ne pas immerger dans l\'eau. Éviter l\'exposition prolongée au soleil direct.',
    care_en: 'Wipe with a slightly damp cloth. Do not soak in water. Avoid prolonged direct sunlight.',
    sizeGuide: [ ['Âge', 'Longueur', 'Poids max'], ['0-2 ans', '22 cm', '2 kg'] ],
    sizeGuide_en: [ ['Age', 'Length', 'Max weight'], ['0-2 years', '22 cm', '2 kg'] ]
  },
  {
    id: 'p2', category: 'jouets', universe: 'educatif', age: '0-2',
    price: 19.9, oldPrice: 24.9, icon: ICONS.peluche, bg: '#ffe6a7',
    colors: ['#ffffff', '#ffcab1', '#a8e6cf'], sale: true,
    name: 'Peluche câline "Nuage"', name_en: 'Cuddly Plush "Cloud"',
    ageLabel: '0-2 ans', ageLabel_en: '0-2 years',
    description: 'Une peluche moelleuse en forme de petit ours, idéale pour accompagner les siestes et calmer les premières nuits. Douceur incomparable garantie.',
    description_en: 'A soft plush in the shape of a little bear, perfect for naptime and soothing early nights. Guaranteed incomparable softness.',
    ecoDetails: 'Fourrure en coton bio recyclé, rembourrage en fibres recyclées certifiées OEKO-TEX.',
    ecoDetails_en: 'Recycled organic cotton fur, OEKO-TEX certified recycled fiber filling.',
    safety: 'Conforme CE EN71, lavable en machine, yeux brodés (aucune petite pièce à avaler).',
    safety_en: 'Complies with CE EN71, machine washable, embroidered eyes (no small parts to swallow).',
    care: 'Lavage en machine à 30°C, cycle délicat. Séchage à l\'air libre uniquement, ne pas repasser.',
    care_en: 'Machine wash at 30°C, delicate cycle. Air dry only, do not iron.',
    sizeGuide: [ ['Taille', 'Hauteur'], ['Unique', '28 cm'] ],
    sizeGuide_en: [ ['Size', 'Height'], ['One size', '28 cm'] ]
  },
  {
    id: 'p3', category: 'vetements', universe: 'coton-bio', age: '0-2',
    price: 14.9, oldPrice: null, icon: ICONS.body, bg: '#ffd6c9',
    colors: ['#ffffff', '#ffe066', '#a8e6cf', '#ffcab1'], sale: false,
    name: 'Body manches longues bio', name_en: 'Organic Long-Sleeve Bodysuit',
    ageLabel: '0-2 ans', ageLabel_en: '0-2 years',
    description: 'Body en jersey de coton biologique, doux et respirant pour la peau sensible des bébés. Coutures plates pour un confort maximal.',
    description_en: 'Organic cotton jersey bodysuit, soft and breathable for sensitive baby skin. Flat seams for maximum comfort.',
    ecoDetails: '100% coton biologique certifié GOTS, colorants naturels sans substances nocives.',
    ecoDetails_en: '100% GOTS-certified organic cotton, natural dyes free of harmful substances.',
    safety: 'Conforme aux normes de sécurité textile CE, sans pressions métalliques dangereuses.',
    safety_en: 'Complies with CE textile safety standards, no hazardous metal snaps.',
    care: 'Lavage en machine à 40°C. Repassage doux si besoin. Éviter l\'assouplissant qui réduit l\'absorption du coton.',
    care_en: 'Machine wash at 40°C. Gentle ironing if needed. Avoid fabric softener, which reduces cotton absorbency.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['50', '0-1 mois', '50 cm'], ['62', '2-3 mois', '62 cm'], ['74', '6-9 mois', '74 cm'], ['86', '12-18 mois', '86 cm'] ],
    sizeGuide_en: [ ['Size', 'Age', 'Height'], ['50', '0-1 month', '50 cm'], ['62', '2-3 months', '62 cm'], ['74', '6-9 months', '74 cm'], ['86', '12-18 months', '86 cm'] ]
  },
  {
    id: 'p4', category: 'vetements', universe: 'plein-air', age: '3-5',
    price: 34.9, oldPrice: 39.9, icon: ICONS.cire, bg: '#ffe066',
    colors: ['#ffe066', '#a8e6cf', '#ffcab1'], sale: true,
    name: 'Ciré de pluie jaune soleil', name_en: 'Sunshine Yellow Rain Coat',
    ageLabel: '3-5 ans', ageLabel_en: '3-5 years',
    description: 'Ciré imperméable et léger pour braver la pluie avec le sourire. Capuche ajustable et bandes réfléchissantes pour plus de visibilité.',
    description_en: 'Lightweight waterproof raincoat to brave the rain with a smile. Adjustable hood and reflective bands for extra visibility.',
    ecoDetails: 'PU sans phtalates, fabrication avec réduction de consommation d\'eau à la teinture.',
    ecoDetails_en: 'Phthalate-free PU, dyeing process with reduced water consumption.',
    safety: 'Conforme CE, boutons-pression sans nickel, cordon de capuche sécurisé (détachable).',
    safety_en: 'Complies with CE, nickel-free snap buttons, safety-detachable hood cord.',
    care: 'Essuyer avec un chiffon humide. Ne pas laver en machine, ne pas repasser.',
    care_en: 'Wipe with a damp cloth. Do not machine wash, do not iron.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['98', '3 ans', '98 cm'], ['104', '4 ans', '104 cm'], ['110', '5 ans', '110 cm'] ],
    sizeGuide_en: [ ['Size', 'Age', 'Height'], ['98', '3 years', '98 cm'], ['104', '4 years', '104 cm'], ['110', '5 years', '110 cm'] ]
  },
  {
    id: 'p5', category: 'jouets', universe: 'educatif', age: '3-5',
    price: 16.9, oldPrice: null, icon: ICONS.puzzle, bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066'], sale: false,
    name: 'Puzzle animaux de la forêt', name_en: 'Forest Animals Puzzle',
    ageLabel: '3-5 ans', ageLabel_en: '3-5 years',
    description: 'Puzzle en bois de 24 pièces illustrant les animaux de la forêt, pour développer la logique et la reconnaissance des formes.',
    description_en: '24-piece wooden puzzle featuring forest animals, developing logic and shape recognition.',
    ecoDetails: 'Bois FSC, encres végétales, emballage en carton recyclé sans plastique.',
    ecoDetails_en: 'FSC wood, plant-based inks, recycled cardboard packaging with no plastic.',
    safety: 'Conforme CE EN71, pièces surdimensionnées empêchant l\'ingestion.',
    safety_en: 'Complies with CE EN71, oversized pieces preventing ingestion.',
    care: 'Dépoussiérer avec un chiffon sec. Ne pas mouiller.',
    care_en: 'Dust with a dry cloth. Do not wet.',
    sizeGuide: [ ['Âge', 'Nombre de pièces'], ['3-5 ans', '24 pièces'] ],
    sizeGuide_en: [ ['Age', 'Number of pieces'], ['3-5 years', '24 pieces'] ]
  },
  {
    id: 'p6', category: 'jouets', universe: 'plein-air', age: '6-12',
    price: 22.9, oldPrice: null, icon: ICONS.cerfvolant, bg: '#d8e4ff',
    colors: ['#ffcab1', '#a8e6cf', '#ffe066'], sale: false,
    name: 'Cerf-volant arc-en-ciel', name_en: 'Rainbow Kite',
    ageLabel: '6-12 ans', ageLabel_en: '6-12 years',
    description: 'Cerf-volant facile à faire voler dès les premiers essais, avec toile résistante et couleurs vives pour illuminer le ciel.',
    description_en: 'A kite that\'s easy to fly from the very first try, with sturdy fabric and bright colors to light up the sky.',
    ecoDetails: 'Toile en polyester recyclé, structure en fibre de verre légère.',
    ecoDetails_en: 'Recycled polyester fabric, lightweight fiberglass frame.',
    safety: 'Conforme CE, cordage renforcé de 30m avec poignée ergonomique anti-coupure.',
    safety_en: 'Complies with CE, reinforced 30m line with an ergonomic anti-cut handle.',
    care: 'Sécher complètement avant rangement pour éviter les moisissures. Plier délicatement.',
    care_en: 'Dry completely before storing to prevent mold. Fold gently.',
    sizeGuide: [ ['Âge recommandé', 'Envergure'], ['6-12 ans', '90 cm'] ],
    sizeGuide_en: [ ['Recommended age', 'Wingspan'], ['6-12 years', '90 cm'] ]
  },
  {
    id: 'p7', category: 'vetements', universe: 'chaussures', age: '3-5',
    price: 27.9, oldPrice: 32.9, icon: ICONS.baskets, bg: '#d8e4ff',
    colors: ['#ffffff', '#a8e6cf', '#ffcab1'], sale: true,
    name: 'Baskets confort coton', name_en: 'Comfort Cotton Sneakers',
    ageLabel: '3-5 ans', ageLabel_en: '3-5 years',
    description: 'Baskets légères en toile de coton avec semelle souple, parfaites pour les premiers pas et les longues journées de jeu.',
    description_en: 'Lightweight cotton canvas sneakers with a soft sole, perfect for first steps and long play days.',
    ecoDetails: 'Toile en coton bio, semelle en caoutchouc naturel, colle sans solvants.',
    ecoDetails_en: 'Organic cotton canvas, natural rubber sole, solvent-free glue.',
    safety: 'Conforme CE, semelle antidérapante testée, fermeture scratch sécurisée.',
    safety_en: 'Complies with CE, tested non-slip sole, secure velcro closure.',
    care: 'Lavage à la main à l\'eau froide. Laisser sécher à plat, à l\'air libre.',
    care_en: 'Hand wash in cold water. Leave to dry flat, in the open air.',
    sizeGuide: [ ['Pointure', 'Âge', 'Longueur pied'], ['24', '3 ans', '15 cm'], ['26', '4 ans', '16 cm'], ['28', '5 ans', '17 cm'] ],
    sizeGuide_en: [ ['Size', 'Age', 'Foot length'], ['24', '3 years', '15 cm'], ['26', '4 years', '16 cm'], ['28', '5 years', '17 cm'] ]
  },
  {
    id: 'p8', category: 'jouets', universe: 'educatif', age: '6-12',
    price: 24.9, oldPrice: null, icon: ICONS.robot, bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066', '#ffcab1'], sale: false,
    name: 'Robot à construire en bois', name_en: 'Wooden Build-Your-Own Robot',
    ageLabel: '6-12 ans', ageLabel_en: '6-12 years',
    description: 'Kit de construction en bois pour assembler son propre robot, sans colle ni outils. Développe la patience et la logique spatiale.',
    description_en: 'Wooden construction kit to build your own robot, no glue or tools needed. Develops patience and spatial logic.',
    ecoDetails: 'Bois de bouleau FSC, pièces à assembler par emboîtement, zéro colle chimique.',
    ecoDetails_en: 'FSC birch wood, snap-together pieces, zero chemical glue.',
    safety: 'Conforme CE EN71, recommandé à partir de 6 ans (petites pièces).',
    safety_en: 'Complies with CE EN71, recommended from age 6 (small parts).',
    care: 'Nettoyage avec un chiffon sec uniquement.',
    care_en: 'Clean with a dry cloth only.',
    sizeGuide: [ ['Âge', 'Pièces', 'Hauteur assemblée'], ['6-12 ans', '32 pièces', '18 cm'] ],
    sizeGuide_en: [ ['Age', 'Pieces', 'Assembled height'], ['6-12 years', '32 pieces', '18 cm'] ]
  },
  {
    id: 'p9', category: 'vetements', universe: 'coton-bio', age: '6-12',
    price: 21.9, oldPrice: null, icon: ICONS.pull, bg: '#ffd6c9',
    colors: ['#ffcab1', '#a8e6cf', '#ffffff'], sale: false,
    name: 'Pull tricot col rond', name_en: 'Round-Neck Knit Sweater',
    ageLabel: '6-12 ans', ageLabel_en: '6-12 years',
    description: 'Pull tricoté en coton biologique, chaud et confortable pour affronter les journées fraîches sans renoncer au style.',
    description_en: 'Knitted organic cotton sweater, warm and comfortable for facing cooler days without giving up on style.',
    ecoDetails: '100% coton bio certifié GOTS, teintures végétales, production locale.',
    ecoDetails_en: '100% GOTS-certified organic cotton, plant-based dyes, local production.',
    safety: 'Conforme aux normes textiles CE, sans cordons ni éléments détachables dangereux.',
    safety_en: 'Complies with CE textile standards, no hazardous cords or detachable parts.',
    care: 'Lavage en machine à 30°C, cycle laine. Séchage à plat, ne pas mettre au sèche-linge.',
    care_en: 'Machine wash at 30°C, wool cycle. Dry flat, do not tumble dry.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['104', '3-4 ans', '104 cm'], ['116', '5-6 ans', '116 cm'], ['128', '7-8 ans', '128 cm'], ['140', '9-10 ans', '140 cm'] ],
    sizeGuide_en: [ ['Size', 'Age', 'Height'], ['104', '3-4 years', '104 cm'], ['116', '5-6 years', '116 cm'], ['128', '7-8 years', '128 cm'], ['140', '9-10 years', '140 cm'] ]
  },
  {
    id: 'p10', category: 'jouets', universe: 'plein-air', age: '3-5',
    price: 44.9, oldPrice: 54.9, icon: ICONS.trottinette, bg: '#ffe6a7',
    colors: ['#ffe066', '#ffcab1', '#a8e6cf'], sale: true,
    name: 'Trottinette pliable 3 roues', name_en: 'Foldable 3-Wheel Scooter',
    ageLabel: '3-5 ans', ageLabel_en: '3-5 years',
    description: 'Trottinette stable à 3 roues avec guidon ajustable en hauteur, pliable pour un rangement facile et un transport pratique.',
    description_en: 'Stable 3-wheel scooter with height-adjustable handlebar, foldable for easy storage and transport.',
    ecoDetails: 'Structure en aluminium recyclable, emballage 100% carton.',
    ecoDetails_en: 'Recyclable aluminum frame, 100% cardboard packaging.',
    safety: 'Conforme CE, frein arrière, roues silencieuses anti-choc, hauteur ajustable pour une croissance en sécurité.',
    safety_en: 'Complies with CE, rear brake, shock-absorbing silent wheels, adjustable height for safe growth.',
    care: 'Essuyer avec un chiffon sec. Vérifier régulièrement le serrage des vis.',
    care_en: 'Wipe with a dry cloth. Check screw tightness regularly.',
    sizeGuide: [ ['Âge', 'Hauteur guidon', 'Poids max'], ['3-5 ans', '56-68 cm', '20 kg'] ],
    sizeGuide_en: [ ['Age', 'Handlebar height', 'Max weight'], ['3-5 years', '56-68 cm', '20 kg'] ]
  },
  {
    id: 'p11', category: 'jouets', universe: 'educatif', age: '0-2',
    price: 12.9, oldPrice: null, icon: ICONS.lapin, bg: '#ffe6a7',
    colors: ['#ffffff', '#ffcab1'], sale: false,
    name: 'Doudou lapin bio', name_en: 'Organic Bunny Comforter',
    ageLabel: '0-2 ans', ageLabel_en: '0-2 years',
    description: 'Petit doudou lapin tout doux avec étiquettes sensorielles, parfait compagnon pour les tout-petits en quête de réconfort.',
    description_en: 'A soft little bunny comforter with sensory tags, the perfect companion for toddlers seeking comfort.',
    ecoDetails: 'Coton bio certifié GOTS, rembourrage hypoallergénique.',
    ecoDetails_en: 'GOTS-certified organic cotton, hypoallergenic filling.',
    safety: 'Conforme CE EN71, lavable en machine, aucune petite pièce.',
    safety_en: 'Complies with CE EN71, machine washable, no small parts.',
    care: 'Lavage en machine à 30°C. Séchage à l\'air libre.',
    care_en: 'Machine wash at 30°C. Air dry.',
    sizeGuide: [ ['Taille', 'Hauteur'], ['Unique', '20 cm'] ],
    sizeGuide_en: [ ['Size', 'Height'], ['One size', '20 cm'] ]
  },
  {
    id: 'p12', category: 'vetements', universe: 'coton-bio', age: '3-5',
    price: 13.9, oldPrice: 17.9, icon: ICONS.legging, bg: '#ffd6c9',
    colors: ['#a8e6cf', '#ffcab1', '#ffe066'], sale: true,
    name: 'Legging coton bio motifs', name_en: 'Organic Cotton Print Leggings',
    ageLabel: '3-5 ans', ageLabel_en: '3-5 years',
    description: 'Legging extensible en coton biologique avec motifs ludiques, taille élastiquée pour un confort optimal toute la journée.',
    description_en: 'Stretchy organic cotton leggings with playful prints, elastic waistband for all-day comfort.',
    ecoDetails: '95% coton bio, 5% élasthanne, encres d\'impression sans substances nocives.',
    ecoDetails_en: '95% organic cotton, 5% elastane, printing inks free of harmful substances.',
    safety: 'Conforme aux normes textiles CE.',
    safety_en: 'Complies with CE textile standards.',
    care: 'Lavage en machine à 30°C. Sèche-linge basse température autorisé.',
    care_en: 'Machine wash at 30°C. Low-temperature tumble dry allowed.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['98', '3 ans', '98 cm'], ['104', '4 ans', '104 cm'], ['110', '5 ans', '110 cm'] ],
    sizeGuide_en: [ ['Size', 'Age', 'Height'], ['98', '3 years', '98 cm'], ['104', '4 years', '104 cm'], ['110', '5 years', '110 cm'] ]
  },

  /* ---- Lots déstockage (clearance bundles) ---- */
  {
    id: 'l1', category: 'destockage', universe: null, age: 'all',
    price: 34.9, oldPrice: 54.7, icon: ICONS.peluche, bg: '#ffe6a7',
    colors: ['#ffffff', '#ffcab1', '#a8e6cf'], sale: false, lot: true,
    name: 'Lot surprise 3 peluches', name_en: 'Surprise 3-Plush Bundle',
    ageLabel: 'Tous âges', ageLabel_en: 'All ages',
    description: 'Un trio de peluches toutes douces à petit prix, parfait pour composer son armée de doudous préférés.',
    description_en: 'A trio of super-soft plush toys at a great price, perfect for building a favorite cuddly-toy squad.',
    ecoDetails: 'Rembourrage en fibres recyclées certifiées OEKO-TEX, fabriqué en coton bio recyclé.',
    ecoDetails_en: 'Recycled OEKO-TEX certified fiber filling, made from recycled organic cotton.',
    safety: 'Conforme CE EN71, lavable en machine, aucune petite pièce détachable.',
    safety_en: 'Complies with CE EN71, machine washable, no small detachable parts.',
    care: 'Lavage en machine à 30°C, cycle délicat. Séchage à l\'air libre.',
    care_en: 'Machine wash at 30°C, delicate cycle. Air dry.',
    sizeGuide: [ ['Contenu', 'Hauteur'], ['3 peluches', '20-28 cm'] ],
    sizeGuide_en: [ ['Contents', 'Height'], ['3 plush toys', '20-28 cm'] ]
  },
  {
    id: 'l2', category: 'destockage', universe: null, age: 'all',
    price: 49.9, oldPrice: 74.5, icon: ICONS.body, bg: '#ffd6c9',
    colors: ['#ffffff', '#ffe066', '#a8e6cf', '#ffcab1'], sale: false, lot: true,
    name: 'Lot de 5 bodies bio', name_en: 'Bundle of 5 Organic Bodysuits',
    ageLabel: 'Tous âges', ageLabel_en: 'All ages',
    description: 'Cinq bodies en coton biologique aux couleurs assorties, pour ne jamais manquer de rechange.',
    description_en: 'Five organic cotton bodysuits in coordinated colors, so you never run out of a spare.',
    ecoDetails: '100% coton biologique certifié GOTS.',
    ecoDetails_en: '100% GOTS-certified organic cotton.',
    safety: 'Conforme aux normes de sécurité textile CE.',
    safety_en: 'Complies with CE textile safety standards.',
    care: 'Lavage en machine à 40°C.',
    care_en: 'Machine wash at 40°C.',
    sizeGuide: [ ['Contenu', 'Tailles'], ['5 bodies', '50 à 86 cm assortis'] ],
    sizeGuide_en: [ ['Contents', 'Sizes'], ['5 bodysuits', '50 to 86 cm assorted'] ]
  },
  {
    id: 'l3', category: 'destockage', universe: null, age: 'all',
    price: 59.9, oldPrice: 67.8, icon: ICONS.trottinette, bg: '#d8e4ff',
    colors: ['#ffe066', '#ffcab1', '#a8e6cf'], sale: false, lot: true,
    name: 'Pack plein air : cerf-volant + trottinette', name_en: 'Outdoor Pack: Kite + Scooter',
    ageLabel: 'Tous âges', ageLabel_en: 'All ages',
    description: 'De quoi enchaîner les sorties au parc : un cerf-volant arc-en-ciel et une trottinette 3 roues pliable.',
    description_en: 'Everything for endless park outings: a rainbow kite and a foldable 3-wheel scooter.',
    ecoDetails: 'Structure en aluminium recyclable, toile en polyester recyclé.',
    ecoDetails_en: 'Recyclable aluminum frame, recycled polyester fabric.',
    safety: 'Conforme CE, freins et cordage sécurisés.',
    safety_en: 'Complies with CE, safe brakes and kite line.',
    care: 'Essuyer avec un chiffon sec. Sécher le cerf-volant avant rangement.',
    care_en: 'Wipe with a dry cloth. Dry the kite before storing.',
    sizeGuide: [ ['Contenu', 'Âge conseillé'], ['1 cerf-volant + 1 trottinette', '3-12 ans'] ],
    sizeGuide_en: [ ['Contents', 'Recommended age'], ['1 kite + 1 scooter', '3-12 years'] ]
  },
  {
    id: 'l4', category: 'destockage', universe: null, age: 'all',
    price: 24.9, oldPrice: 33.8, icon: ICONS.puzzle, bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066'], sale: false, lot: true,
    name: 'Duo puzzles éducatifs', name_en: 'Educational Puzzle Duo',
    ageLabel: 'Tous âges', ageLabel_en: 'All ages',
    description: 'Deux puzzles en bois pour multiplier les défis et les fous rires en famille.',
    description_en: 'Two wooden puzzles to multiply the challenges and family fun.',
    ecoDetails: 'Bois FSC, encres végétales.',
    ecoDetails_en: 'FSC wood, plant-based inks.',
    safety: 'Conforme CE EN71.',
    safety_en: 'Complies with CE EN71.',
    care: 'Dépoussiérer avec un chiffon sec.',
    care_en: 'Dust with a dry cloth.',
    sizeGuide: [ ['Contenu', 'Pièces'], ['2 puzzles', '24 pièces chacun'] ],
    sizeGuide_en: [ ['Contents', 'Pieces'], ['2 puzzles', '24 pieces each'] ]
  }
];

/* ===================== LOYALTY TIERS ===================== */
const LOYALTY_TIERS = [
  { threshold: 30, reward: 'Code -5€ sur votre prochaine commande', reward_en: '€5 off your next order' },
  { threshold: 75, reward: 'Un cadeau surprise offert 🎁', reward_en: 'A free surprise gift 🎁' },
  { threshold: 150, reward: 'Livraison gratuite à vie', reward_en: 'Free shipping for life' }
];

module.exports = { ICONS, PRODUCTS, LOYALTY_TIERS };
