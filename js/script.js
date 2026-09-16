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

/* ===================== DATA (fetched from the API) ===================== */
/* The product catalog and loyalty tiers are no longer hardcoded here: they are
   the server's responsibility (see server/products-data.js) and are fetched
   once at startup, so the browser is never the source of truth for them. */
let PRODUCTS = [];
let LOYALTY_TIERS = [];

/* ===================== API CLIENT ===================== */
/* Thin wrapper around fetch() for the small Express + SQLite backend that
   owns the cart, favorites, loyalty points and orders (see server/index.js).
   The visitor is identified by a random cookie the server sets on first
   request — no accounts, but state now lives server-side instead of
   localStorage, so it's a real (if minimal) cart API rather than a client-only
   simulation. */
const API_BASE = '/api';
async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data && data.error) message = data.error;
    } catch (_) { /* ignore non-JSON error bodies */ }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

function applyCartResponse(data) {
  state.cart = data.items.map(i => ({ itemId: i.itemId, id: i.productId, color: i.color, qty: i.qty }));
}

async function loadCatalog() {
  PRODUCTS = await apiFetch('/products');
}
async function loadCart() {
  applyCartResponse(await apiFetch('/cart'));
}
async function loadFavorites() {
  const data = await apiFetch('/favorites');
  state.favorites = data.productIds;
}
async function loadLoyalty() {
  const data = await apiFetch('/loyalty');
  state.loyaltyPoints = data.points;
  LOYALTY_TIERS = data.tiers;
  state.memberNumber = data.memberNumber;
  state.physicalCardRequested = data.physicalCardRequested;
}

/* ===================== TRANSLATIONS ===================== */
const TRANSLATIONS = {
  fr: {
    'topbar.text': '🚚 Livraison offerte dès 20€ d\'achat &nbsp;•&nbsp; ✨ -20% sur les soldes avec le code SOLEIL',
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
    'fav.remove': 'Retirer des favoris', 'fav.addAria': 'Ajouter aux favoris', 'fav.removeAria': 'Retirer des favoris',
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
    'checkout.cancelled': 'Paiement annulé, votre panier est toujours là.',
    'loyalty.title': 'Carte de fidélité', 'loyalty.aria': 'Carte de fidélité', 'loyalty.points': 'points',
    'loyalty.tiersTitle': 'Récompenses', 'loyalty.maxed': 'Bravo, vous avez débloqué toutes les récompenses ! 🎉',
    'loyalty.viewCard': 'Voir ma carte de fidélité complète →',
    'loyalty.hero.title': 'Votre carte de fidélité BBHappY',
    'loyalty.hero.desc': 'Cumulez des points à chaque commande (1 € dépensé = 1 point) et débloquez des récompenses automatiquement.',
    'loyalty.member': 'Membre BBHappY', 'loyalty.memberNew': 'Nouveau membre',
    'loyalty.card.number': 'N° de membre', 'loyalty.card.points': 'points',
    'loyalty.table.title': 'Tableau des récompenses',
    'loyalty.table.status': 'Statut', 'loyalty.table.threshold': 'Points requis', 'loyalty.table.reward': 'Récompense',
    'loyalty.physicalCard.eyebrow': 'Carte physique',
    'loyalty.physicalCard.title': 'Recevez votre carte chez vous',
    'loyalty.physicalCard.desc': 'Votre carte virtuelle ci-dessus est déjà active et cumule des points automatiquement. Vous pouvez en plus recevoir une carte physique à présenter en magasin partenaire, envoyée gratuitement par courrier sous 10 à 15 jours.',
    'loyalty.physicalCard.name': 'Nom complet', 'loyalty.physicalCard.address': 'Adresse',
    'loyalty.physicalCard.zip': 'Code postal', 'loyalty.physicalCard.city': 'Ville',
    'loyalty.physicalCard.submit': 'Recevoir ma carte physique',
    'loyalty.physicalCard.toast': 'Demande enregistrée ! Votre carte physique arrive sous 10 à 15 jours 📮',
    'loyalty.physicalCard.confirmed.title': 'Carte physique en préparation ✅',
    'loyalty.physicalCard.confirmed.desc': 'Votre demande a bien été enregistrée, votre carte vous sera envoyée par courrier sous 10 à 15 jours.',
    'lang.toggle': '🇬🇧 EN',
    'brand0.desc': 'Jouets en bois massif fabriqués en Europe, finitions à l\'eau et certification FSC sur tout le bois utilisé.',
    'brand0.cta': 'Voir les jouets éducatifs →',
    'brand1.desc': 'Équipements de plein air pensés pour résister aux jeux les plus intenses, sans jamais sacrifier la sécurité.',
    'brand1.cta': 'Voir les jouets plein air →',
    'brand2.desc': 'Vêtements 100% coton biologique certifié GOTS, confectionnés pour la peau sensible des tout-petits.',
    'brand2.cta': 'Voir les vêtements coton bio →',
    'brand3.desc': 'Chaussures souples et respirantes, conçues avec des podologues pour accompagner chaque étape de la croissance.',
    'brand3.cta': 'Voir les chaussures →',
    'error.generic': 'Un problème est survenu, réessayez.',
    'error.offline': 'Impossible de joindre le serveur BBHappY. Vérifiez qu\'il tourne bien (npm start).',
    'shipping.hero.title': 'Livraison & retours',
    'shipping.hero.desc': 'Tout ce qu\'il faut savoir pour recevoir vos commandes sereinement, et les retourner tout aussi simplement en cas de besoin.',
    'shipping.delivery.eyebrow': 'Livraison', 'shipping.delivery.title': 'Des options adaptées à vos envies',
    'shipping.standard.title': 'Standard', 'shipping.standard.desc': '3 à 5 jours ouvrés — 4,90 €, gratuite dès 20 € d\'achat',
    'shipping.express.title': 'Express', 'shipping.express.desc': '24 à 48h ouvrées — 9,90 €',
    'shipping.europe.title': 'Europe', 'shipping.europe.desc': '5 à 8 jours ouvrés — à partir de 9,90 €',
    'shipping.tracking.title': 'Suivi en temps réel', 'shipping.tracking.desc': 'Un lien de suivi vous est envoyé dès l\'expédition de votre colis',
    'shipping.returns.eyebrow': 'Retours', 'shipping.returns.title': '30 jours pour changer d\'avis',
    'shipping.returns.desc': 'Si un article ne convient pas, vous pouvez le retourner sans justification dans les 30 jours suivant sa réception.',
    'shipping.step1.title': '1. Contactez-nous', 'shipping.step1.desc': 'Par e-mail à <a href="mailto:bbvoltex@gmail.com">bbvoltex@gmail.com</a>, sous 30 jours après réception',
    'shipping.step2.title': '2. Renvoyez l\'article', 'shipping.step2.desc': 'Dans son emballage d\'origine, avec l\'étiquette de retour fournie',
    'shipping.step3.title': '3. Remboursement', 'shipping.step3.desc': 'Sous 5 à 7 jours ouvrés après réception de votre retour',
    'shipping.exclusions': 'Les articles soldés à -50% ou plus, les sous-vêtements et les cadeaux personnalisés ne sont pas repris pour des raisons d\'hygiène.'
  },
  en: {
    'topbar.text': '🚚 Free delivery from €20 &nbsp;•&nbsp; ✨ -20% on sale items with code SOLEIL',
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
    'fav.remove': 'Remove from favorites', 'fav.addAria': 'Add to favorites', 'fav.removeAria': 'Remove from favorites',
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
    'checkout.cancelled': 'Payment cancelled, your cart is still here.',
    'loyalty.title': 'Loyalty card', 'loyalty.aria': 'Loyalty card', 'loyalty.points': 'points',
    'loyalty.tiersTitle': 'Rewards', 'loyalty.maxed': 'Congrats, you\'ve unlocked every reward! 🎉',
    'loyalty.viewCard': 'See my full loyalty card →',
    'loyalty.hero.title': 'Your BBHappY loyalty card',
    'loyalty.hero.desc': 'Earn points with every order (€1 spent = 1 point) and unlock rewards automatically.',
    'loyalty.member': 'BBHappY member', 'loyalty.memberNew': 'New member',
    'loyalty.card.number': 'Member no.', 'loyalty.card.points': 'points',
    'loyalty.table.title': 'Rewards table',
    'loyalty.table.status': 'Status', 'loyalty.table.threshold': 'Points required', 'loyalty.table.reward': 'Reward',
    'loyalty.physicalCard.eyebrow': 'Physical card',
    'loyalty.physicalCard.title': 'Get your card at home',
    'loyalty.physicalCard.desc': 'Your virtual card above is already active and earns points automatically. You can also receive a physical card to show in partner stores, mailed to you for free within 10 to 15 days.',
    'loyalty.physicalCard.name': 'Full name', 'loyalty.physicalCard.address': 'Address',
    'loyalty.physicalCard.zip': 'Zip code', 'loyalty.physicalCard.city': 'City',
    'loyalty.physicalCard.submit': 'Get my physical card',
    'loyalty.physicalCard.toast': 'Request saved! Your physical card is on its way (10 to 15 days) 📮',
    'loyalty.physicalCard.confirmed.title': 'Physical card on its way ✅',
    'loyalty.physicalCard.confirmed.desc': 'Your request has been recorded, your card will be mailed to you within 10 to 15 days.',
    'lang.toggle': '🇫🇷 FR',
    'brand0.desc': 'Solid wood toys made in Europe, water-based finishes and FSC certification on all wood used.',
    'brand0.cta': 'See educational toys →',
    'brand1.desc': 'Outdoor gear designed to withstand the most intense play, without ever compromising on safety.',
    'brand1.cta': 'See outdoor toys →',
    'brand2.desc': '100% GOTS-certified organic cotton clothing, made for sensitive toddler skin.',
    'brand2.cta': 'See organic cotton clothing →',
    'brand3.desc': 'Soft, breathable shoes designed with podiatrists to support every stage of growth.',
    'brand3.cta': 'See shoes →',
    'error.generic': 'Something went wrong, please try again.',
    'error.offline': 'Could not reach the BBHappY server. Make sure it is running (npm start).',
    'shipping.hero.title': 'Shipping & Returns',
    'shipping.hero.desc': 'Everything you need to know to receive your orders with peace of mind, and return them just as easily if needed.',
    'shipping.delivery.eyebrow': 'Shipping', 'shipping.delivery.title': 'Options to suit your needs',
    'shipping.standard.title': 'Standard', 'shipping.standard.desc': '3 to 5 business days — €4.90, free from €20 of purchase',
    'shipping.express.title': 'Express', 'shipping.express.desc': '24 to 48 business hours — €9.90',
    'shipping.europe.title': 'Europe', 'shipping.europe.desc': '5 to 8 business days — from €9.90',
    'shipping.tracking.title': 'Real-time tracking', 'shipping.tracking.desc': 'A tracking link is sent to you as soon as your parcel ships',
    'shipping.returns.eyebrow': 'Returns', 'shipping.returns.title': '30 days to change your mind',
    'shipping.returns.desc': 'If an item doesn\'t work out, you can return it with no questions asked within 30 days of receiving it.',
    'shipping.step1.title': '1. Contact us', 'shipping.step1.desc': 'By email at <a href="mailto:bbvoltex@gmail.com">bbvoltex@gmail.com</a>, within 30 days of receipt',
    'shipping.step2.title': '2. Send the item back', 'shipping.step2.desc': 'In its original packaging, with the provided return label',
    'shipping.step3.title': '3. Refund', 'shipping.step3.desc': 'Within 5 to 7 business days after we receive your return',
    'shipping.exclusions': 'Items on sale at -50% or more, underwear and personalized gifts cannot be returned for hygiene reasons.'
  }
};

/* ===================== STATE ===================== */
/* cart, favorites and loyaltyPoints start empty and are filled in from the
   API (see loadCart/loadFavorites/loadLoyalty) once the page has loaded —
   the server is the source of truth for all three, not localStorage. */
const state = {
  categoryFilter: document.body.dataset.category || 'all',
  ageFilter: null,
  universeFilter: new URLSearchParams(location.search).get('universe') || null,
  searchTerm: '',
  lang: localStorage.getItem('bbhappy_lang') || 'fr',
  cart: [],
  favorites: [],
  loyaltyPoints: 0,
  memberNumber: '',
  physicalCardRequested: false,
  currentModalProduct: null,
  currentModalColor: null
};

const fmtPrice = (n) => n.toFixed(2).replace('.', ',') + ' €';

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
        <button class="product-fav ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="${isFav ? t('fav.removeAria') : t('fav.addAria')}" aria-pressed="${isFav}">${isFav ? '❤️' : '🤍'}</button>
        <div class="product-icon">${p.icon}</div>
      </div>
      <div class="product-body">
        <span class="product-age">${pf(p, 'ageLabel')}</span>
        <h3><button type="button" class="product-name" data-open="${p.id}">${pf(p, 'name')}</button></h3>
        <p class="product-price">${fmtPrice(p.price)}${p.oldPrice ? `<span class="old-price">${fmtPrice(p.oldPrice)}</span>` : ''}</p>
        <div class="color-swatches">
          ${p.colors.map((c, i) => `<button type="button" class="swatch ${i === 0 ? 'selected' : ''}" style="background:${c}" data-color="${c}" data-product="${p.id}" aria-label="${colorName(c)}" aria-pressed="${i === 0}"></button>`).join('')}
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
  const alreadyOpen = document.getElementById('productModal').classList.contains('open');
  if (!alreadyOpen) lastFocusedElement = document.activeElement;
  state.currentModalProduct = p;
  state.currentModalColor = p.colors[0];

  document.getElementById('modalImage').innerHTML = p.icon;
  document.getElementById('modalImage').style.background = p.bg;
  document.getElementById('modalAge').textContent = pf(p, 'ageLabel');
  document.getElementById('modalProductName').textContent = pf(p, 'name');
  document.getElementById('modalPrice').innerHTML = `${fmtPrice(p.price)}${p.oldPrice ? `<span class="old-price">${fmtPrice(p.oldPrice)}</span>` : ''}`;
  document.getElementById('modalQty').value = 1;

  const colorsWrap = document.getElementById('modalColors');
  colorsWrap.innerHTML = p.colors.map((c, i) => `<button type="button" class="swatch ${i === 0 ? 'selected' : ''}" style="width:28px;height:28px;background:${c}" data-modal-color="${c}" aria-label="${colorName(c)}" aria-pressed="${i === 0}"></button>`).join('');

  const favBtn = document.getElementById('modalFav');
  const isFav = state.favorites.includes(p.id);
  favBtn.textContent = isFav ? '❤️' : '🤍';
  favBtn.classList.toggle('active', isFav);
  favBtn.setAttribute('aria-label', isFav ? t('fav.removeAria') : t('fav.addAria'));
  favBtn.setAttribute('aria-pressed', String(isFav));

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

  const modal = document.getElementById('productModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
  if (!alreadyOpen) document.getElementById('modalClose').focus();
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  releaseFocus(modal);
  restoreFocus();
}

/* ===================== CART ===================== */
/* Every mutation round-trips to the server (see server/index.js) — the cart
   itself lives in SQLite, keyed by the visitor's cookie, not in the browser. */
async function addToCart(productId, color, qty = 1) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  try {
    applyCartResponse(await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, color, qty })
    }));
    renderCart();
    updateCounts();
    showToast(`${pf(p, 'name')} ${t('toast.added')}`);
    bumpCart();
  } catch (err) {
    showToast(err.message || t('error.generic'));
  }
}

async function updateCartQty(itemId, newQty) {
  try {
    applyCartResponse(await apiFetch(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ qty: newQty })
    }));
    renderCart();
    updateCounts();
  } catch (err) {
    showToast(err.message || t('error.generic'));
  }
}

async function removeFromCart(itemId) {
  try {
    applyCartResponse(await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' }));
    renderCart();
    updateCounts();
  } catch (err) {
    showToast(err.message || t('error.generic'));
  }
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
          <p><span class="swatch" aria-hidden="true" style="display:inline-block;width:12px;height:12px;background:${item.color};vertical-align:middle;margin-right:4px;"></span>${fmtPrice(p.price)}</p>
          <div class="cart-item-controls">
            <button data-qty-minus="${item.itemId}">−</button>
            <span>${item.qty}</span>
            <button data-qty-plus="${item.itemId}">+</button>
          </div>
          <button class="cart-item-remove" data-remove="${item.itemId}">${t('cart.remove')}</button>
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
async function toggleFavorite(productId) {
  const isFav = state.favorites.includes(productId);
  try {
    if (isFav) {
      await apiFetch(`/favorites/${productId}`, { method: 'DELETE' });
      state.favorites = state.favorites.filter(id => id !== productId);
    } else {
      await apiFetch(`/favorites/${productId}`, { method: 'POST' });
      state.favorites.push(productId);
    }
  } catch (err) {
    showToast(err.message || t('error.generic'));
    return;
  }
  renderProducts();
  renderFavorites();
  updateCounts();

  if (state.currentModalProduct && state.currentModalProduct.id === productId) {
    const favBtn = document.getElementById('modalFav');
    const nowFav = state.favorites.includes(productId);
    favBtn.textContent = nowFav ? '❤️' : '🤍';
    favBtn.classList.toggle('active', nowFav);
    favBtn.setAttribute('aria-label', nowFav ? t('fav.removeAria') : t('fav.addAria'));
    favBtn.setAttribute('aria-pressed', String(nowFav));
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
        <h5><button type="button" class="fav-item-name" data-open="${p.id}">${pf(p, 'name')}</button></h5>
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
/* Used for one-off bonuses (the newsletter reward). Points earned from an
   order are credited server-side as part of POST /api/checkout instead. */
async function addLoyaltyBonus(amount) {
  if (amount <= 0) return;
  try {
    const data = await apiFetch('/loyalty/bonus', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
    state.loyaltyPoints = data.points;
    renderLoyalty();
  } catch (err) {
    showToast(err.message || t('error.generic'));
  }
}

function renderLoyalty() {
  const badge = document.getElementById('loyaltyBadge');
  if (badge) badge.textContent = state.loyaltyPoints;

  const valueEl = document.getElementById('loyaltyPointsValue');
  if (!valueEl) return; // loyalty drawer not present on this page render pass
  valueEl.textContent = state.loyaltyPoints;

  // A page can show the progress bar/remaining-points text more than once
  // (e.g. both the loyalty drawer and the dedicated card page), so every
  // matching element is kept in sync rather than looking up a single id.
  const nextTier = LOYALTY_TIERS.find(tier => state.loyaltyPoints < tier.threshold);
  const bars = document.querySelectorAll('.loyalty-progress-bar');
  const nextTexts = document.querySelectorAll('.loyalty-next');
  if (nextTier) {
    const prevThreshold = LOYALTY_TIERS.filter(x => x.threshold <= nextTier.threshold && x !== nextTier).slice(-1)[0]?.threshold || 0;
    const pct = Math.min(100, Math.round(((state.loyaltyPoints - prevThreshold) / (nextTier.threshold - prevThreshold)) * 100));
    bars.forEach(bar => { bar.style.width = pct + '%'; });
    const remaining = nextTier.threshold - state.loyaltyPoints;
    const reward = state.lang === 'en' ? nextTier.reward_en : nextTier.reward;
    const text = state.lang === 'en'
      ? `${remaining} more points to unlock: ${reward}`
      : `Encore ${remaining} points pour débloquer : ${reward}`;
    nextTexts.forEach(el => { el.textContent = text; });
  } else {
    bars.forEach(bar => { bar.style.width = '100%'; });
    nextTexts.forEach(el => { el.textContent = t('loyalty.maxed'); });
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

  renderLoyaltyCardPage();
}

/* Populates the dedicated carte-fidelite.html page, when present: the
   virtual card visual, the full rewards table and the physical-card
   request form/confirmation. No-op on every other page. */
function renderLoyaltyCardPage() {
  const cardPoints = document.getElementById('loyaltyCardPoints');
  if (!cardPoints) return;
  cardPoints.textContent = state.loyaltyPoints;

  const cardNumber = document.getElementById('loyaltyCardNumber');
  if (cardNumber) cardNumber.textContent = state.memberNumber ? `BB-${state.memberNumber}` : '—';

  const reachedTiers = LOYALTY_TIERS.filter(tier => state.loyaltyPoints >= tier.threshold);
  const currentTier = reachedTiers[reachedTiers.length - 1];
  const tierName = document.getElementById('loyaltyCardTierName');
  if (tierName) tierName.textContent = currentTier ? t('loyalty.member') : t('loyalty.memberNew');

  const table = document.getElementById('loyaltyTiersTableBody');
  if (table) {
    table.innerHTML = LOYALTY_TIERS.map(tier => {
      const reached = state.loyaltyPoints >= tier.threshold;
      const reward = state.lang === 'en' ? tier.reward_en : tier.reward;
      return `<tr class="${reached ? 'reached' : ''}">
        <td>${reached ? '✅' : '🔒'}</td>
        <td><strong>${tier.threshold}</strong> ${t('loyalty.points')}</td>
        <td>${reward}</td>
      </tr>`;
    }).join('');
  }

  const form = document.getElementById('physicalCardForm');
  const confirmed = document.getElementById('physicalCardConfirmed');
  if (form && confirmed) {
    form.hidden = state.physicalCardRequested;
    confirmed.hidden = !state.physicalCardRequested;
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
  lastFocusedElement = document.activeElement;
  renderCheckoutSummary();
  const form = document.getElementById('checkoutForm');
  const success = document.getElementById('checkoutSuccess');
  form.hidden = false;
  form.reset();
  success.hidden = true;
  const modal = document.getElementById('checkoutModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
  document.getElementById('checkoutName').focus();
}

function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  releaseFocus(modal);
  restoreFocus();
}

/* Shows the order confirmation screen — used both right after a no-payment
   checkout (local dev without Stripe configured) and when the visitor lands
   back on the site after completing a real Stripe payment. */
async function showOrderSuccess(order) {
  const modal = document.getElementById('checkoutModal');
  document.getElementById('checkoutOrderNumber').textContent = order.orderNumber;
  document.getElementById('checkoutPointsEarned').textContent = order.pointsEarned;
  document.getElementById('checkoutForm').hidden = true;
  const successPanel = document.getElementById('checkoutSuccess');
  successPanel.hidden = false;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(modal);
  successPanel.focus();
  state.cart = [];
  renderCart();
  updateCounts();
  await loadLoyalty();
  renderLoyalty();
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
  updateCounts();
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

/* ===================== FOCUS MANAGEMENT ===================== */
/* Keeps keyboard focus inside an open modal/drawer and restores it to the
   triggering element on close, so keyboard and screen-reader users never
   get stranded on hidden background content. */
let lastFocusedElement = null;
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(container) {
  releaseFocus(container);
  const handler = (e) => {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', handler);
  container._trapHandler = handler;
}
function releaseFocus(container) {
  if (container._trapHandler) {
    container.removeEventListener('keydown', container._trapHandler);
    container._trapHandler = null;
  }
}
function focusFirstIn(container) {
  const focusable = container.querySelector(FOCUSABLE_SELECTOR);
  if (focusable) focusable.focus();
}
function restoreFocus() {
  if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

/* ===================== DRAWERS ===================== */
function openDrawer(drawer, overlay) {
  lastFocusedElement = document.activeElement;
  drawer.classList.add('open');
  overlay.classList.add('open');
  trapFocus(drawer);
  focusFirstIn(drawer);
}
function closeDrawer(drawer, overlay) {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  releaseFocus(drawer);
  restoreFocus();
}

/* ===================== EVENT WIRING ===================== */
document.addEventListener('DOMContentLoaded', async () => {
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

  // Pull the catalog, cart, favorites and loyalty points from the API before
  // the first render — the server is the source of truth for all of them.
  try {
    await loadCatalog();
    await Promise.all([loadCart(), loadFavorites(), loadLoyalty()]);
  } catch (err) {
    console.error('BBHappY API unreachable:', err);
    showToast(t('error.offline'));
  }

  applyLanguage();

  // Returning from Stripe Checkout: confirm the payment and show the order
  // confirmation, or let the visitor know a payment was cancelled.
  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');
  const checkoutCancelled = params.get('checkout') === 'cancelled';
  if (sessionId || checkoutCancelled) {
    history.replaceState(null, '', location.pathname);
  }
  if (sessionId) {
    apiFetch(`/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then(order => showOrderSuccess(order))
      .catch(err => showToast(err.message || t('error.generic')));
  } else if (checkoutCancelled) {
    showToast(t('checkout.cancelled'));
  }

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
        card.querySelectorAll('.swatch').forEach(s => { s.classList.remove('selected'); s.setAttribute('aria-pressed', 'false'); });
        swatch.classList.add('selected');
        swatch.setAttribute('aria-pressed', 'true');
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
    document.querySelectorAll('#modalColors .swatch').forEach(s => { s.classList.remove('selected'); s.setAttribute('aria-pressed', 'false'); });
    sw.classList.add('selected');
    sw.setAttribute('aria-pressed', 'true');
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
    if (minus) {
      const item = state.cart.find(i => String(i.itemId) === minus.dataset.qtyMinus);
      if (item) updateCartQty(item.itemId, item.qty - 1);
    }
    if (plus) {
      const item = state.cart.find(i => String(i.itemId) === plus.dataset.qtyPlus);
      if (item) updateCartQty(item.itemId, item.qty + 1);
    }
    if (remove) removeFromCart(Number(remove.dataset.remove));
  });

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (state.cart.length === 0) {
      showToast(t('checkout.emptyCart'));
      return;
    }
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
  document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('checkoutName').value,
      email: document.getElementById('checkoutEmail').value,
      address: document.getElementById('checkoutAddress').value,
      zip: document.getElementById('checkoutZip').value,
      city: document.getElementById('checkoutCity').value
    };
    const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const result = await apiFetch('/checkout', { method: 'POST', body: JSON.stringify(payload) });
      if (result.redirectUrl) {
        // Real payment required: hand off to Stripe's hosted checkout page.
        // The order itself is only created once payment is confirmed, after
        // Stripe redirects back (see the ?session_id handling below).
        window.location.href = result.redirectUrl;
        return;
      }
      await showOrderSuccess(result);
    } catch (err) {
      showToast(err.message || t('error.generic'));
    } finally {
      submitBtn.disabled = false;
    }
  });
  document.getElementById('checkoutCloseSuccess').addEventListener('click', closeCheckout);

  // Newsletter (also grants a small loyalty bonus)
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('newsletterMsg');
    msg.textContent = t('newsletter.success');
    addLoyaltyBonus(10);
    e.target.reset();
    setTimeout(() => { msg.textContent = ''; }, 5000);
  });

  const physicalCardForm = document.getElementById('physicalCardForm');
  if (physicalCardForm) {
    physicalCardForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/loyalty/physical-card', {
          method: 'POST',
          body: JSON.stringify({
            name: document.getElementById('physicalCardName').value,
            address: document.getElementById('physicalCardAddress').value,
            zip: document.getElementById('physicalCardZip').value,
            city: document.getElementById('physicalCardCity').value
          })
        });
        state.physicalCardRequested = true;
        renderLoyaltyCardPage();
        showToast(t('loyalty.physicalCard.toast'));
      } catch (err) {
        showToast(err.message || t('error.generic'));
      }
    });
  }

  // Sticky header shrink on scroll (subtle)
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });
});
