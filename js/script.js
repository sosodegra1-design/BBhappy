/* ===================== ICONS ===================== */
/* Simple flat vector icons (white on the product's pastel background) used instead of emoji. */
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

/* ===================== TRANSLATIONS ===================== */
const TRANSLATIONS = {
  fr: {
    'topbar.text': '🚚 Livraison offerte dès 49€ &nbsp;•&nbsp; ✨ -20% sur les soldes avec le code SOLEIL',
    'nav.home': 'Accueil', 'nav.toys': 'Jouets', 'nav.clothing': 'Vêtements', 'nav.brands': 'Marques', 'nav.sales': 'Soldes 🔥',
    'search.placeholder': 'Rechercher un jouet, un vêtement...',
    'hero.tag': '✨ Nouvelle collection printemps',
    'hero.title': 'Là où l\'imagination<br>rencontre le <span class="highlight">confort</span>',
    'hero.desc': 'Des jouets qui éveillent la créativité et des vêtements doux comme un câlin, pensés pour les petites aventures du quotidien.',
    'hero.cta1': 'Acheter maintenant', 'hero.cta2': 'Découvrir les univers',
    'hero.stat1': 'familles conquises', 'hero.stat2': 'matériaux sûrs', 'hero.stat3': 'note moyenne',
    'categories.eyebrow': 'Explorer', 'categories.title': 'Trouver le bonheur par univers ou par âge',
    'categories.desc': 'Filtrez notre boutique selon les envies et l\'âge de votre enfant.',
    'sub.byage': 'Par âge', 'sub.byuniverse': 'Par univers',
    'sub.byage2': 'Filtrer par âge', 'sub.byuniverse2': 'Filtrer par univers',
    'age.0-2': '0–2 ans', 'age.3-5': '3–5 ans', 'age.6-12': '6–12 ans',
    'uni.educatif.title': 'Jouets éducatifs', 'uni.educatif.desc': 'Apprendre en s\'amusant',
    'uni.pleinair.title': 'Plein air', 'uni.pleinair.desc': 'Aventures en extérieur',
    'uni.cotonbio.title': 'Coton bio', 'uni.cotonbio.desc': 'Doux pour leur peau',
    'uni.chaussures.title': 'Chaussures', 'uni.chaussures.desc': 'Confort à chaque pas',
    'products.eyebrow': 'Coups de cœur', 'products.title': 'Produits vedettes',
    'products.desc': 'Une sélection pensée avec amour pour petits explorateurs.',
    'chip.all': 'Tout voir', 'chip.toys': 'Jouets', 'chip.clothing': 'Vêtements', 'chip.sales': 'Soldes 🔥',
    'empty.state': 'Aucun produit ne correspond à votre recherche 🧐 Essayez un autre filtre !',
    'trust.delivery.title': 'Livraison rapide', 'trust.delivery.desc': 'Expédié en 24h, chez vous en 2 à 4 jours',
    'trust.eco.title': 'Emballage éco-responsable', 'trust.eco.desc': 'Cartons recyclés, zéro plastique à usage unique',
    'trust.safe.title': 'Matériaux 100% sûrs', 'trust.safe.desc': 'Certifiés CE, testés et approuvés par nos experts',
    'trust.payment.title': 'Paiement sécurisé', 'trust.payment.desc': 'Vos données protégées, transactions cryptées',
    'tab.description': 'Description', 'tab.care': 'Entretien', 'tab.sizes': 'Tailles/Âges',
    'modal.eco': 'Détails écologiques', 'modal.safety': 'Normes de sécurité',
    'modal.qty': 'Quantité', 'modal.addtocart': 'Ajouter au panier',
    'cart.title': 'Votre panier', 'cart.empty': 'Votre panier est vide pour le moment 🧺',
    'cart.total': 'Total', 'cart.checkout': 'Passer la commande', 'cart.remove': 'Retirer',
    'fav.title': 'Vos favoris', 'fav.empty': 'Aucun favori pour l\'instant 💛<br>Cliquez sur le cœur d\'un produit !',
    'fav.remove': 'Retirer des favoris', 'fav.addAria': 'Ajouter aux favoris',
    'toast.added': 'ajouté au panier 🛒',
    'badge.sale': 'Soldes', 'badge.lot': 'Lot',
    'newsletter.title': 'Rejoignez la famille BBHappY 💌',
    'newsletter.desc': 'Recevez -10% sur votre première commande et nos nouveautés en avant-première.',
    'newsletter.placeholder': 'Votre adresse e-mail', 'newsletter.button': 'S\'inscrire',
    'newsletter.success': 'Merci pour votre inscription ! 🎉 +10 points de fidélité offerts.',
    'footer.shop': 'Boutique', 'footer.destock': 'Lots déstockage', 'footer.service': 'Service client',
    'footer.contact': 'Contactez-nous', 'footer.shipping': 'Livraison &amp; retours',
    'footer.sizeguide': 'Guide des tailles', 'footer.faq': 'FAQ', 'footer.about': 'À propos',
    'footer.story': 'Notre histoire', 'footer.eco': 'Engagement éco-responsable',
    'footer.safety': 'Normes de sécurité', 'footer.careers': 'Carrières',
    'footer.copy': '© 2026 BBHappY — Tous droits réservés.',
    'breadcrumb.home': 'Accueil',
    'jouets.hero.title': 'L\'univers Jouets',
    'jouets.hero.desc': 'Des jouets pensés pour éveiller la curiosité, en bois durable ou en tissus tout doux, pour chaque âge et chaque aventure.',
    'vetements.hero.title': 'L\'univers Vêtements',
    'vetements.hero.desc': 'Du coton biologique tout doux aux chaussures confortables, des vêtements pensés pour le confort et les petites aventures.',
    'soldes.hero.title': 'Soldes BBHappY',
    'soldes.hero.desc': 'Jusqu\'à -20% avec le code <strong>SOLEIL</strong> sur une sélection de jouets et vêtements. Ça ne dure pas, on en profite !',
    'soldes.destocklink': 'Voir les lots déstockage →',
    'marques.hero.title': 'Nos marques partenaires',
    'marques.hero.desc': 'BBHappY sélectionne pour vous des marques engagées, soucieuses de la sécurité des enfants et de la planète.',
    'destockage.hero.title': 'Lots déstockage 📦',
    'destockage.hero.desc': 'Des packs multi-produits à prix cassés pour équiper toute la fratrie sans se ruiner, jusqu\'à épuisement des stocks.',
    'checkout.title': 'Finaliser la commande', 'checkout.name': 'Nom complet', 'checkout.email': 'E-mail',
    'checkout.address': 'Adresse', 'checkout.zip': 'Code postal', 'checkout.city': 'Ville',
    'checkout.submit': 'Confirmer la commande', 'checkout.summaryTitle': 'Récapitulatif',
    'checkout.success.title': 'Merci pour votre commande !',
    'checkout.success.desc': 'Un e-mail de confirmation vous a été envoyé.',
    'checkout.orderNumber': 'Numéro de commande', 'checkout.pointsEarned': 'de fidélité gagnés !',
    'checkout.close': 'Fermer', 'checkout.emptyCart': 'Votre panier est vide, ajoutez des produits avant de commander 🧺',
    'loyalty.title': 'Carte de fidélité', 'loyalty.aria': 'Carte de fidélité', 'loyalty.points': 'points',
    'loyalty.tiersTitle': 'Récompenses', 'loyalty.maxed': 'Bravo, vous avez débloqué toutes les récompenses ! 🎉',
    'lang.toggle': '🇬🇧 EN',
    'brand0.desc': 'Jouets en bois massif fabriqués en Europe, finitions à l\'eau et certification FSC sur tout le bois utilisé.',
    'brand0.cta': 'Voir les jouets éducatifs →',
    'brand1.desc': 'Équipements de plein air pensés pour résister aux jeux les plus intenses, sans jamais sacrifier la sécurité.',
    'brand1.cta': 'Voir les jouets plein air →',
    'brand2.desc': 'Vêtements 100% coton biologique certifié GOTS, confectionnés pour la peau sensible des tout-petits.',
    'brand2.cta': 'Voir les vêtements coton bio →',
    'brand3.desc': 'Chaussures souples et respirantes, conçues avec des podologues pour accompagner chaque étape de la croissance.',
    'brand3.cta': 'Voir les chaussures →'
  },
  en: {
    'topbar.text': '🚚 Free delivery from €49 &nbsp;•&nbsp; ✨ -20% on sale items with code SOLEIL',
    'nav.home': 'Home', 'nav.toys': 'Toys', 'nav.clothing': 'Clothing', 'nav.brands': 'Brands', 'nav.sales': 'Sale 🔥',
    'search.placeholder': 'Search for a toy, an outfit...',
    'hero.tag': '✨ New spring collection',
    'hero.title': 'Where imagination<br>meets <span class="highlight">comfort</span>',
    'hero.desc': 'Toys that spark creativity and clothes as soft as a hug, made for everyday little adventures.',
    'hero.cta1': 'Shop now', 'hero.cta2': 'Discover the collections',
    'hero.stat1': 'happy families', 'hero.stat2': 'safe materials', 'hero.stat3': 'average rating',
    'categories.eyebrow': 'Explore', 'categories.title': 'Find happiness by category or by age',
    'categories.desc': 'Filter our shop by your child\'s age and interests.',
    'sub.byage': 'By age', 'sub.byuniverse': 'By category',
    'sub.byage2': 'Filter by age', 'sub.byuniverse2': 'Filter by category',
    'age.0-2': '0–2 years', 'age.3-5': '3–5 years', 'age.6-12': '6–12 years',
    'uni.educatif.title': 'Educational toys', 'uni.educatif.desc': 'Learning through play',
    'uni.pleinair.title': 'Outdoor', 'uni.pleinair.desc': 'Outdoor adventures',
    'uni.cotonbio.title': 'Organic cotton', 'uni.cotonbio.desc': 'Gentle on their skin',
    'uni.chaussures.title': 'Shoes', 'uni.chaussures.desc': 'Comfort with every step',
    'products.eyebrow': 'Favorites', 'products.title': 'Featured products',
    'products.desc': 'A selection made with love for little explorers.',
    'chip.all': 'View all', 'chip.toys': 'Toys', 'chip.clothing': 'Clothing', 'chip.sales': 'Sale 🔥',
    'empty.state': 'No products match your search 🧐 Try a different filter!',
    'trust.delivery.title': 'Fast delivery', 'trust.delivery.desc': 'Shipped within 24h, delivered in 2-4 days',
    'trust.eco.title': 'Eco-friendly packaging', 'trust.eco.desc': 'Recycled boxes, zero single-use plastic',
    'trust.safe.title': '100% safe materials', 'trust.safe.desc': 'CE certified, tested and approved by our experts',
    'trust.payment.title': 'Secure payment', 'trust.payment.desc': 'Your data protected, encrypted transactions',
    'tab.description': 'Description', 'tab.care': 'Care', 'tab.sizes': 'Sizes/Ages',
    'modal.eco': 'Eco-friendly details', 'modal.safety': 'Safety standards',
    'modal.qty': 'Quantity', 'modal.addtocart': 'Add to cart',
    'cart.title': 'Your cart', 'cart.empty': 'Your cart is empty for now 🧺',
    'cart.total': 'Total', 'cart.checkout': 'Checkout', 'cart.remove': 'Remove',
    'fav.title': 'Your favorites', 'fav.empty': 'No favorites yet 💛<br>Click the heart on a product!',
    'fav.remove': 'Remove from favorites', 'fav.addAria': 'Add to favorites',
    'toast.added': 'added to cart 🛒',
    'badge.sale': 'Sale', 'badge.lot': 'Bundle',
    'newsletter.title': 'Join the BBHappY family 💌',
    'newsletter.desc': 'Get -10% on your first order and be first to know about new arrivals.',
    'newsletter.placeholder': 'Your email address', 'newsletter.button': 'Subscribe',
    'newsletter.success': 'Thanks for subscribing! 🎉 +10 loyalty points added.',
    'footer.shop': 'Shop', 'footer.destock': 'Clearance bundles', 'footer.service': 'Customer service',
    'footer.contact': 'Contact us', 'footer.shipping': 'Shipping &amp; returns',
    'footer.sizeguide': 'Size guide', 'footer.faq': 'FAQ', 'footer.about': 'About',
    'footer.story': 'Our story', 'footer.eco': 'Eco-friendly commitment',
    'footer.safety': 'Safety standards', 'footer.careers': 'Careers',
    'footer.copy': '© 2026 BBHappY — All rights reserved.',
    'breadcrumb.home': 'Home',
    'jouets.hero.title': 'The Toys collection',
    'jouets.hero.desc': 'Toys designed to spark curiosity, in durable wood or the softest fabrics, for every age and every adventure.',
    'vetements.hero.title': 'The Clothing collection',
    'vetements.hero.desc': 'From soft organic cotton to comfy shoes, clothes designed for comfort and little adventures.',
    'soldes.hero.title': 'BBHappY Sale',
    'soldes.hero.desc': 'Up to -20% with code <strong>SOLEIL</strong> on a selection of toys and clothing. It won\'t last, grab it now!',
    'soldes.destocklink': 'See clearance bundles →',
    'marques.hero.title': 'Our partner brands',
    'marques.hero.desc': 'BBHappY selects committed brands for you, caring about children\'s safety and the planet.',
    'destockage.hero.title': 'Clearance bundles 📦',
    'destockage.hero.desc': 'Multi-product packs at unbeatable prices to gear up the whole family without breaking the bank, while stocks last.',
    'checkout.title': 'Complete your order', 'checkout.name': 'Full name', 'checkout.email': 'Email',
    'checkout.address': 'Address', 'checkout.zip': 'ZIP code', 'checkout.city': 'City',
    'checkout.submit': 'Confirm order', 'checkout.summaryTitle': 'Order summary',
    'checkout.success.title': 'Thank you for your order!',
    'checkout.success.desc': 'A confirmation email has been sent to you.',
    'checkout.orderNumber': 'Order number', 'checkout.pointsEarned': 'loyalty points earned!',
    'checkout.close': 'Close', 'checkout.emptyCart': 'Your cart is empty, add products before checking out 🧺',
    'loyalty.title': 'Loyalty card', 'loyalty.aria': 'Loyalty card', 'loyalty.points': 'points',
    'loyalty.tiersTitle': 'Rewards', 'loyalty.maxed': 'Congrats, you\'ve unlocked every reward! 🎉',
    'lang.toggle': '🇫🇷 FR',
    'brand0.desc': 'Solid wood toys made in Europe, water-based finishes and FSC certification on all wood used.',
    'brand0.cta': 'See educational toys →',
    'brand1.desc': 'Outdoor gear designed to withstand the most intense play, without ever compromising on safety.',
    'brand1.cta': 'See outdoor toys →',
    'brand2.desc': '100% GOTS-certified organic cotton clothing, made for sensitive toddler skin.',
    'brand2.cta': 'See organic cotton clothing →',
    'brand3.desc': 'Soft, breathable shoes designed with podiatrists to support every stage of growth.',
    'brand3.cta': 'See shoes →'
  }
};

/* ===================== STATE ===================== */
const state = {
  categoryFilter: document.body.dataset.category || 'all',
  ageFilter: null,
  universeFilter: new URLSearchParams(location.search).get('universe') || null,
  searchTerm: '',
  lang: localStorage.getItem('bbhappy_lang') || 'fr',
  cart: JSON.parse(localStorage.getItem('bbhappy_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('bbhappy_favorites') || '[]'),
  loyaltyPoints: parseInt(localStorage.getItem('bbhappy_points') || '0', 10),
  currentModalProduct: null,
  currentModalColor: null
};

const fmtPrice = (n) => n.toFixed(2).replace('.', ',') + ' €';
const saveState = () => {
  localStorage.setItem('bbhappy_cart', JSON.stringify(state.cart));
  localStorage.setItem('bbhappy_favorites', JSON.stringify(state.favorites));
};

function t(key) {
  return (TRANSLATIONS[state.lang] && TRANSLATIONS[state.lang][key]) || TRANSLATIONS.fr[key] || key;
}
/* Returns a product field in the current language, falling back to French. */
function pf(p, field) {
  if (state.lang === 'en' && p[field + '_en'] !== undefined) return p[field + '_en'];
  return p[field];
}

/* ===================== RENDER PRODUCTS ===================== */
function getFilteredProducts() {
  return PRODUCTS.filter(p => {
    if (state.categoryFilter === 'soldes' && !p.sale) return false;
    if (state.categoryFilter !== 'all' && state.categoryFilter !== 'soldes' && p.category !== state.categoryFilter) return false;
    if (state.ageFilter && p.age !== state.ageFilter && p.age !== 'all') return false;
    if (state.universeFilter && p.universe !== state.universeFilter) return false;
    if (state.searchTerm && !pf(p, 'name').toLowerCase().includes(state.searchTerm.toLowerCase())) return false;
    return true;
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const empty = document.getElementById('emptyState');
  const list = getFilteredProducts();
  grid.innerHTML = '';
  if (empty) empty.hidden = list.length !== 0;

  list.forEach(p => {
    const isFav = state.favorites.includes(p.id);
    const badge = p.lot
      ? `<span class="product-badge lot-badge">${t('badge.lot')}</span>`
      : (p.sale ? `<span class="product-badge">${t('badge.sale')}</span>` : '');
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-media" style="--product-bg:${p.bg}" data-open="${p.id}">
        ${badge}
        <button class="product-fav ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="${t('fav.addAria')}">${isFav ? '❤️' : '🤍'}</button>
        <div class="product-icon">${p.icon}</div>
      </div>
      <div class="product-body">
        <span class="product-age">${pf(p, 'ageLabel')}</span>
        <h3 class="product-name" data-open="${p.id}">${pf(p, 'name')}</h3>
        <p class="product-price">${fmtPrice(p.price)}${p.oldPrice ? `<span class="old-price">${fmtPrice(p.oldPrice)}</span>` : ''}</p>
        <div class="color-swatches">
          ${p.colors.map((c, i) => `<span class="swatch ${i === 0 ? 'selected' : ''}" style="background:${c}" data-color="${c}" data-product="${p.id}"></span>`).join('')}
        </div>
        <button class="add-cart-btn" data-add="${p.id}">${t('modal.addtocart')}</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ===================== MODAL ===================== */
function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  state.currentModalProduct = p;
  state.currentModalColor = p.colors[0];

  document.getElementById('modalImage').innerHTML = p.icon;
  document.getElementById('modalImage').style.background = p.bg;
  document.getElementById('modalAge').textContent = pf(p, 'ageLabel');
  document.getElementById('modalProductName').textContent = pf(p, 'name');
  document.getElementById('modalPrice').innerHTML = `${fmtPrice(p.price)}${p.oldPrice ? `<span class="old-price">${fmtPrice(p.oldPrice)}</span>` : ''}`;
  document.getElementById('modalQty').value = 1;

  const colorsWrap = document.getElementById('modalColors');
  colorsWrap.innerHTML = p.colors.map((c, i) => `<span class="swatch ${i === 0 ? 'selected' : ''}" style="width:28px;height:28px;background:${c}" data-modal-color="${c}"></span>`).join('');

  const favBtn = document.getElementById('modalFav');
  const isFav = state.favorites.includes(p.id);
  favBtn.textContent = isFav ? '❤️' : '🤍';
  favBtn.classList.toggle('active', isFav);

  document.getElementById('panelDescription').innerHTML = `
    <p>${pf(p, 'description')}</p>
    <h4 style="margin-top:16px;font-size:.95rem;">${t('modal.eco')}</h4>
    <p>${pf(p, 'ecoDetails')}</p>
    <h4 style="margin-top:16px;font-size:.95rem;">${t('modal.safety')}</h4>
    <p>${pf(p, 'safety')}</p>
  `;
  document.getElementById('panelEntretien').innerHTML = `<p>${pf(p, 'care')}</p>`;
  const rows = pf(p, 'sizeGuide');
  document.getElementById('panelTailles').innerHTML = `
    <table class="size-table">
      <thead><tr>${rows[0].map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  `;

  document.querySelectorAll('.tab-btn').forEach((btn, i) => btn.classList.toggle('active', i === 0));
  document.querySelectorAll('.tab-panel').forEach((panel, i) => panel.classList.toggle('active', i === 0));

  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ===================== CART ===================== */
function addToCart(productId, color, qty = 1) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const key = productId + '|' + color;
  const existing = state.cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ key, id: productId, color, qty });
  }
  saveState();
  renderCart();
  updateCounts();
  showToast(`${pf(p, 'name')} ${t('toast.added')}`);
  bumpCart();
}

function updateCartQty(key, delta) {
  const item = state.cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(i => i.key !== key);
  }
  saveState();
  renderCart();
  updateCounts();
}

function removeFromCart(key) {
  state.cart = state.cart.filter(i => i.key !== key);
  saveState();
  renderCart();
  updateCounts();
}

function cartTotal() {
  return state.cart.reduce((sum, i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

function renderCart() {
  const wrap = document.getElementById('cartItems');
  if (state.cart.length === 0) {
    wrap.innerHTML = `<p class="drawer-empty">${t('cart.empty')}</p>`;
  } else {
    wrap.innerHTML = state.cart.map(item => {
      const p = PRODUCTS.find(x => x.id === item.id);
      if (!p) return '';
      return `
      <div class="cart-item">
        <div class="cart-item-media" style="background:${p.bg}">${p.icon}</div>
        <div class="cart-item-info">
          <h5>${pf(p, 'name')}</h5>
          <p><span class="swatch" style="display:inline-block;width:12px;height:12px;background:${item.color};vertical-align:middle;margin-right:4px;"></span>${fmtPrice(p.price)}</p>
          <div class="cart-item-controls">
            <button data-qty-minus="${item.key}">−</button>
            <span>${item.qty}</span>
            <button data-qty-plus="${item.key}">+</button>
          </div>
          <button class="cart-item-remove" data-remove="${item.key}">${t('cart.remove')}</button>
        </div>
      </div>
    `;
    }).join('');
  }
  document.getElementById('cartTotal').textContent = fmtPrice(cartTotal());
}

function bumpCart() {
  const btn = document.getElementById('cartBtn');
  btn.classList.remove('bump');
  void btn.offsetWidth;
  btn.classList.add('bump');
}

/* ===================== FAVORITES ===================== */
function toggleFavorite(productId) {
  const idx = state.favorites.indexOf(productId);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
  } else {
    state.favorites.push(productId);
  }
  saveState();
  renderProducts();
  renderFavorites();
  updateCounts();

  if (state.currentModalProduct && state.currentModalProduct.id === productId) {
    const favBtn = document.getElementById('modalFav');
    const isFav = state.favorites.includes(productId);
    favBtn.textContent = isFav ? '❤️' : '🤍';
    favBtn.classList.toggle('active', isFav);
  }
}

function renderFavorites() {
  const wrap = document.getElementById('favItems');
  const favProducts = PRODUCTS.filter(p => state.favorites.includes(p.id));
  if (favProducts.length === 0) {
    wrap.innerHTML = `<p class="drawer-empty">${t('fav.empty')}</p>`;
    return;
  }
  wrap.innerHTML = favProducts.map(p => `
    <div class="cart-item">
      <div class="cart-item-media" style="background:${p.bg}">${p.icon}</div>
      <div class="cart-item-info">
        <h5 style="cursor:pointer" data-open="${p.id}">${pf(p, 'name')}</h5>
        <p>${fmtPrice(p.price)}</p>
        <button class="cart-item-remove" data-unfav="${p.id}">${t('fav.remove')}</button>
      </div>
    </div>
  `).join('');
}

function updateCounts() {
  const cartCount = state.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').textContent = cartCount;
  document.getElementById('floatingCartBadge').textContent = cartCount;
  document.getElementById('favCount').textContent = state.favorites.length;
}

/* ===================== LOYALTY ===================== */
function addLoyaltyPoints(n) {
  if (n <= 0) return;
  state.loyaltyPoints += n;
  localStorage.setItem('bbhappy_points', String(state.loyaltyPoints));
  renderLoyalty();
}

function renderLoyalty() {
  const badge = document.getElementById('loyaltyBadge');
  if (badge) badge.textContent = state.loyaltyPoints;

  const valueEl = document.getElementById('loyaltyPointsValue');
  if (!valueEl) return; // loyalty drawer not present on this page render pass
  valueEl.textContent = state.loyaltyPoints;

  const nextTier = LOYALTY_TIERS.find(tier => state.loyaltyPoints < tier.threshold);
  const bar = document.getElementById('loyaltyProgressBar');
  const nextText = document.getElementById('loyaltyNextText');
  if (nextTier) {
    const prevThreshold = LOYALTY_TIERS.filter(x => x.threshold <= nextTier.threshold && x !== nextTier).slice(-1)[0]?.threshold || 0;
    const pct = Math.min(100, Math.round(((state.loyaltyPoints - prevThreshold) / (nextTier.threshold - prevThreshold)) * 100));
    if (bar) bar.style.width = pct + '%';
    if (nextText) {
      const remaining = nextTier.threshold - state.loyaltyPoints;
      const reward = state.lang === 'en' ? nextTier.reward_en : nextTier.reward;
      nextText.textContent = state.lang === 'en'
        ? `${remaining} more points to unlock: ${reward}`
        : `Encore ${remaining} points pour débloquer : ${reward}`;
    }
  } else {
    if (bar) bar.style.width = '100%';
    if (nextText) nextText.textContent = t('loyalty.maxed');
  }

  const tiersList = document.getElementById('loyaltyTiers');
  if (tiersList) {
    tiersList.innerHTML = LOYALTY_TIERS.map(tier => {
      const reached = state.loyaltyPoints >= tier.threshold;
      const reward = state.lang === 'en' ? tier.reward_en : tier.reward;
      return `<li class="loyalty-tier ${reached ? 'reached' : ''}">
        <span class="loyalty-tier-check">${reached ? '✅' : '🔒'}</span>
        <span class="loyalty-tier-info"><strong>${tier.threshold} ${t('loyalty.points')}</strong> — ${reward}</span>
      </li>`;
    }).join('');
  }
}

/* ===================== CHECKOUT ===================== */
function renderCheckoutSummary() {
  const summary = document.getElementById('checkoutSummary');
  if (!summary) return;
  const total = cartTotal();
  const lines = state.cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return '';
    return `<div class="checkout-line"><span>${pf(p, 'name')} × ${item.qty}</span><span>${fmtPrice(p.price * item.qty)}</span></div>`;
  }).join('');
  summary.innerHTML = `<h4>${t('checkout.summaryTitle')}</h4>${lines}<div class="checkout-line checkout-line-total"><span>${t('cart.total')}</span><span>${fmtPrice(total)}</span></div>`;
}

function openCheckout() {
  if (state.cart.length === 0) {
    showToast(t('checkout.emptyCart'));
    return;
  }
  renderCheckoutSummary();
  const form = document.getElementById('checkoutForm');
  const success = document.getElementById('checkoutSuccess');
  form.hidden = false;
  form.reset();
  success.hidden = true;
  document.getElementById('checkoutModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.body.style.overflow = '';
}

/* ===================== i18n APPLY ===================== */
function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = t('lang.toggle');

  renderProducts();
  renderCart();
  renderFavorites();
  renderLoyalty();
  if (state.currentModalProduct && document.getElementById('productModal').classList.contains('open')) {
    openProductModal(state.currentModalProduct.id);
  }
}

/* ===================== TOAST ===================== */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ===================== DRAWERS ===================== */
function openDrawer(drawer, overlay) {
  drawer.classList.add('open');
  overlay.classList.add('open');
}
function closeDrawer(drawer, overlay) {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
}

/* ===================== EVENT WIRING ===================== */
document.addEventListener('DOMContentLoaded', () => {
  // Pre-select the universe card matching the ?universe= query param (deep link from another page)
  if (state.universeFilter) {
    const preselected = document.querySelector(`.category-card[data-filter-universe="${state.universeFilter}"]`);
    if (preselected) preselected.classList.add('active');
  }
  // Pre-select the matching category chip (if the page has one)
  const preselectedChip = document.querySelector(`.chip[data-filter="${state.categoryFilter}"]`);
  if (preselectedChip) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    preselectedChip.classList.add('active');
  }

  applyLanguage();

  // Product grid delegation
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    productGrid.addEventListener('click', (e) => {
      const openId = e.target.closest('[data-open]');
      const favId = e.target.closest('[data-fav]');
      const addId = e.target.closest('[data-add]');
      const swatch = e.target.closest('.swatch[data-product]');

      if (swatch) {
        const card = swatch.closest('.product-card');
        card.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        return;
      }
      if (favId) { toggleFavorite(favId.dataset.fav); return; }
      if (addId) {
        const card = addId.closest('.product-card');
        const selectedSwatch = card.querySelector('.swatch.selected');
        const color = selectedSwatch ? selectedSwatch.dataset.color : PRODUCTS.find(p => p.id === addId.dataset.add).colors[0];
        addToCart(addId.dataset.add, color, 1);
        return;
      }
      if (openId) { openProductModal(openId.dataset.open); return; }
    });
  }

  // Filter chips (category)
  const filterChips = document.getElementById('filterChips');
  if (filterChips) {
    filterChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.categoryFilter = chip.dataset.filter;
      renderProducts();
    });
  }

  // Age filter cards
  document.querySelectorAll('.age-card').forEach(card => {
    card.addEventListener('click', () => {
      const age = card.dataset.filterAge;
      const isActive = card.classList.contains('active');
      document.querySelectorAll('.age-card').forEach(c => c.classList.remove('active'));
      if (isActive) {
        state.ageFilter = null;
      } else {
        card.classList.add('active');
        state.ageFilter = age;
      }
      renderProducts();
      const anchor = document.getElementById('produits');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Universe filter cards (only wired as filters when they are <button> elements;
  // on the homepage these are plain links that simply navigate to the dedicated page)
  document.querySelectorAll('button.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const universe = card.dataset.filterUniverse;
      const isActive = card.classList.contains('active');
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
      if (isActive) {
        state.universeFilter = null;
      } else {
        card.classList.add('active');
        state.universeFilter = universe;
      }
      renderProducts();
      const anchor = document.getElementById('produits');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Search
  const doSearch = (val) => {
    state.searchTerm = val;
    renderProducts();
  };
  document.getElementById('searchInput').addEventListener('input', (e) => doSearch(e.target.value));
  document.getElementById('searchInputMobile').addEventListener('input', (e) => doSearch(e.target.value));

  document.getElementById('searchToggle').addEventListener('click', () => {
    document.getElementById('searchBarMobile').classList.toggle('open');
  });

  // Language toggle
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      state.lang = state.lang === 'fr' ? 'en' : 'fr';
      localStorage.setItem('bbhappy_lang', state.lang);
      applyLanguage();
    });
  }

  // Burger / mobile nav
  const burger = document.getElementById('burgerBtn');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    document.getElementById('mainNav').classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });
  function closeMobileNav() {
    burger.classList.remove('open');
    document.getElementById('mainNav').classList.remove('open');
    document.body.classList.remove('nav-open');
  }
  document.body.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open') && !e.target.closest('.main-nav') && !e.target.closest('.burger')) {
      closeMobileNav();
    }
  });

  // Modal wiring
  document.getElementById('modalClose').addEventListener('click', closeProductModal);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') closeProductModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCheckout();
      closeDrawer(document.getElementById('cartDrawer'), document.getElementById('cartOverlay'));
      closeDrawer(document.getElementById('favDrawer'), document.getElementById('favOverlay'));
      closeDrawer(document.getElementById('loyaltyDrawer'), document.getElementById('loyaltyOverlay'));
    }
  });

  document.getElementById('modalColors').addEventListener('click', (e) => {
    const sw = e.target.closest('[data-modal-color]');
    if (!sw) return;
    state.currentModalColor = sw.dataset.modalColor;
    document.querySelectorAll('#modalColors .swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
  });

  document.getElementById('qtyMinus').addEventListener('click', () => {
    const input = document.getElementById('modalQty');
    input.value = Math.max(1, parseInt(input.value || '1', 10) - 1);
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    const input = document.getElementById('modalQty');
    input.value = parseInt(input.value || '1', 10) + 1;
  });

  document.getElementById('modalAddToCart').addEventListener('click', () => {
    if (!state.currentModalProduct) return;
    const qty = parseInt(document.getElementById('modalQty').value || '1', 10);
    addToCart(state.currentModalProduct.id, state.currentModalColor, qty);
  });

  document.getElementById('modalFav').addEventListener('click', () => {
    if (state.currentModalProduct) toggleFavorite(state.currentModalProduct.id);
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
    });
  });

  // Cart drawer
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  document.getElementById('cartBtn').addEventListener('click', () => openDrawer(cartDrawer, cartOverlay));
  document.getElementById('floatingCart').addEventListener('click', () => openDrawer(cartDrawer, cartOverlay));
  document.getElementById('cartClose').addEventListener('click', () => closeDrawer(cartDrawer, cartOverlay));
  cartOverlay.addEventListener('click', () => closeDrawer(cartDrawer, cartOverlay));

  document.getElementById('cartItems').addEventListener('click', (e) => {
    const minus = e.target.closest('[data-qty-minus]');
    const plus = e.target.closest('[data-qty-plus]');
    const remove = e.target.closest('[data-remove]');
    if (minus) updateCartQty(minus.dataset.qtyMinus, -1);
    if (plus) updateCartQty(plus.dataset.qtyPlus, 1);
    if (remove) removeFromCart(remove.dataset.remove);
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    closeDrawer(cartDrawer, cartOverlay);
    openCheckout();
  });

  // Favorites drawer
  const favDrawer = document.getElementById('favDrawer');
  const favOverlay = document.getElementById('favOverlay');
  document.getElementById('favBtn').addEventListener('click', () => openDrawer(favDrawer, favOverlay));
  document.getElementById('favClose').addEventListener('click', () => closeDrawer(favDrawer, favOverlay));
  favOverlay.addEventListener('click', () => closeDrawer(favDrawer, favOverlay));

  document.getElementById('favItems').addEventListener('click', (e) => {
    const unfav = e.target.closest('[data-unfav]');
    const open = e.target.closest('[data-open]');
    if (unfav) { toggleFavorite(unfav.dataset.unfav); return; }
    if (open) { closeDrawer(favDrawer, favOverlay); openProductModal(open.dataset.open); }
  });

  // Loyalty drawer
  const loyaltyDrawer = document.getElementById('loyaltyDrawer');
  const loyaltyOverlay = document.getElementById('loyaltyOverlay');
  document.getElementById('loyaltyBtn').addEventListener('click', () => { renderLoyalty(); openDrawer(loyaltyDrawer, loyaltyOverlay); });
  document.getElementById('loyaltyClose').addEventListener('click', () => closeDrawer(loyaltyDrawer, loyaltyOverlay));
  loyaltyOverlay.addEventListener('click', () => closeDrawer(loyaltyDrawer, loyaltyOverlay));

  // Checkout modal
  document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
  document.getElementById('checkoutModal').addEventListener('click', (e) => {
    if (e.target.id === 'checkoutModal') closeCheckout();
  });
  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const total = cartTotal();
    const points = Math.round(total);
    addLoyaltyPoints(points);
    const orderNumber = 'BB' + Date.now().toString().slice(-8);
    document.getElementById('checkoutOrderNumber').textContent = orderNumber;
    document.getElementById('checkoutPointsEarned').textContent = points;
    document.getElementById('checkoutForm').hidden = true;
    document.getElementById('checkoutSuccess').hidden = false;
    state.cart = [];
    saveState();
    renderCart();
    updateCounts();
  });
  document.getElementById('checkoutCloseSuccess').addEventListener('click', closeCheckout);

  // Newsletter (also grants a small loyalty bonus)
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('newsletterMsg');
    msg.textContent = t('newsletter.success');
    addLoyaltyPoints(10);
    e.target.reset();
    setTimeout(() => { msg.textContent = ''; }, 5000);
  });

  // Sticky header shrink on scroll (subtle)
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });
});
