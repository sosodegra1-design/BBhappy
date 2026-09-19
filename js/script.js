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
    'nav.home': 'Accueil', 'nav.toys': 'Jouets', 'nav.clothing': 'Vêtements', 'nav.brands': 'Bijoux & Accessoires', 'nav.brands.l1': 'Bijoux', 'nav.brands.l2': 'Accessoires', 'nav.sales': 'Soldes 🔥',
    'nav.box': 'Box <svg width="16" height="16" viewBox="0 0 100 100" style="vertical-align:-2px;margin-left:2px;"><path d="M50 8 88 28 50 48 12 28Z" fill="#e8c896"/><path d="M12 28v42l38 22V50Z" fill="#c68642"/><path d="M88 28v42L50 92V50Z" fill="#9c6a34"/><path d="M44 31v61l6 3.5V34.5Z" fill="#d4af37"/></svg>', 'nav.box2': 'Box',
    'nav.categories': 'Catégories ▾', 'nav.tech': 'Électronique', 'nav.home2': 'Maison &amp; Déco',
    'nav.beauty': 'Beauté', 'nav.sport': 'Sport &amp; Loisirs',
    'mega.kids': 'Enfants', 'mega.home': 'Maison &amp; Bien-être', 'mega.techsport': 'Tech &amp; Sport',
    'electronique.hero.title': 'L\'univers Électronique',
    'electronique.hero.desc': 'Écouteurs, enceintes et objets connectés sélectionnés pour leur qualité et leur fiabilité au quotidien.',
    'maison.hero.title': 'L\'univers Maison &amp; Déco',
    'maison.hero.desc': 'Luminaires, textiles et petites attentions artisanales pour sublimer votre intérieur au quotidien.',
    'beaute.hero.title': 'L\'univers Beauté &amp; Bien-être',
    'beaute.hero.desc': 'Des soins et cosmétiques formulés avec des ingrédients naturels, pour prendre soin de vous chaque jour.',
    'sport.hero.title': 'L\'univers Sport &amp; Loisirs',
    'sport.hero.desc': 'Du matériel simple et durable pour bouger à la maison ou en extérieur, à tout âge et à tout niveau.',
    'box.hero.title': 'Box — Emballages &amp; boîtes carton',
    'box.hero.desc': 'Des boîtes en carton pensées pour les snacks et pâtisseries, en petites ou grandes quantités, pour les particuliers comme pour les petites entreprises.',
    'search.placeholder': 'Rechercher un jouet, un vêtement...',
    'hero.tag': '✨ Sélection premium',
    'hero.title': 'L\'exigence au service<br>de votre <span class="highlight">quotidien</span>',
    'hero.desc': 'Mode, high-tech, maison, beauté et sport : une sélection rigoureuse de produits fiables, livrés en toute sécurité.',
    'hero.cta1': 'Découvrir la boutique', 'hero.cta2': 'Voir les catégories',
    'hero.stat1': 'clients satisfaits', 'hero.stat2': 'paiement sécurisé', 'hero.stat3': 'note moyenne',
    'hero.visual1': 'Électronique', 'hero.visual2': 'Mode', 'hero.visual3': 'Maison',
    'categories.eyebrow': 'Explorer', 'categories.title': 'Toutes nos catégories',
    'categories.desc': 'Un catalogue unique pour tous vos besoins, sélectionné avec la même exigence de qualité.',
    'sub.byage': 'Par âge', 'sub.byuniverse': 'Par univers',
    'sub.byage2': 'Filtrer par âge', 'sub.byuniverse2': 'Filtrer par univers',
    'age.0-2': '0–2 ans', 'age.3-5': '3–5 ans', 'age.6-12': '6–12 ans',
    'uni.educatif.title': 'Jouets éducatifs', 'uni.educatif.desc': 'Apprendre en s\'amusant',
    'uni.pleinair.title': 'Plein air', 'uni.pleinair.desc': 'Aventures en extérieur',
    'uni.homme.title': 'Homme', 'uni.homme.desc': 'Vestiaire masculin',
    'uni.femme.title': 'Femme', 'uni.femme.desc': 'Vestiaire féminin',
    'uni.enfant.title': 'Enfant', 'uni.enfant.desc': 'Vestiaire enfant',
    'uni.fille.title': 'Fille', 'uni.fille.desc': 'Univers doux et créatif',
    'uni.garcon.title': 'Garçon', 'uni.garcon.desc': 'Univers action et découverte',
    'uni.bebe.title': 'Bébé', 'uni.bebe.desc': 'Premiers éveils en douceur',
    'products.eyebrow': 'Coups de cœur', 'products.title': 'Produits vedettes',
    'products.desc': 'Une sélection rigoureuse à travers toutes nos catégories.',
    'search.eyebrow': 'Résultats de recherche',
    'search.resultsFor': 'Résultats pour « %s »',
    'search.resultsDesc': '%s produit(s) trouvé(s) dans tout le catalogue.',
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
    'newsletter.title': 'Rejoignez la famille BBVOLTEX 💌',
    'newsletter.desc': 'Recevez -10% sur votre première commande et nos nouveautés en avant-première.',
    'newsletter.placeholder': 'Votre adresse e-mail', 'newsletter.button': 'S\'inscrire',
    'newsletter.success': 'Merci pour votre inscription ! 🎉 +10 points de fidélité offerts.',
    'footer.shop': 'Boutique', 'footer.destock': 'Lots déstockage', 'footer.service': 'Service client',
    'footer.contact': 'Contactez-nous', 'footer.shipping': 'Livraison &amp; retours',
    'footer.tracking': 'Suivre ma commande',
    'footer.sizeguide': 'Guide des tailles', 'footer.faq': 'FAQ', 'footer.about': 'À propos',
    'footer.story': 'Notre histoire', 'footer.eco': 'Engagement éco-responsable',
    'footer.safety': 'Normes de sécurité', 'footer.careers': 'Carrières',
    'footer.copy': '© 2026 BBVOLTEX — Tous droits réservés.',
    'breadcrumb.home': 'Accueil',
    'jouets.hero.title': 'L\'univers Jouets',
    'jouets.hero.desc': 'Des jouets conçus pour durer et éveiller la curiosité : matériaux nobles, finitions soignées et sécurité irréprochable, à chaque âge.',
    'vetements.hero.title': 'L\'univers Vêtements',
    'vetements.hero.desc': 'Homme, Femme, Enfant : des vêtements pensés pour le confort et le style, à chaque âge et chaque occasion.',
    'soldes.hero.title': 'Soldes BBVOLTEX',
    'soldes.hero.desc': 'Jusqu\'à -20% avec le code <strong>SOLEIL</strong> sur une sélection de produits. Ça ne dure pas, on en profite !',
    'soldes.destocklink': 'Voir les lots déstockage →',
    'bijoux.hero.title': 'L\'univers Bijoux & Accessoires',
    'bijoux.hero.desc': 'Colliers, bracelets, bagues, ceintures, montres et sacs : des pièces choisies pour leur qualité, à personnaliser selon vos envies.',
    'uni.collier.title': 'Collier', 'uni.collier.desc': 'Pendentifs & chaînes',
    'uni.bracelet.title': 'Bracelet', 'uni.bracelet.desc': 'Fins ou statement',
    'uni.bague.title': 'Bague', 'uni.bague.desc': 'Anneaux & solitaires',
    'uni.ceinture.title': 'Ceinture', 'uni.ceinture.desc': 'Cuir & boucles',
    'uni.montre.title': 'Montre', 'uni.montre.desc': 'Classiques & connectées',
    'uni.sacamain.title': 'Sac à main femme', 'uni.sacamain.desc': 'Élégance au quotidien',
    'uni.sacados.title': 'Sacoche / Sac à dos', 'uni.sacados.desc': 'Pratiques & nomades',
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
    'checkout.trackOrder': 'Suivre ma commande →',
    'tracking.title': 'Suivi de commande',
    'tracking.hero.title': 'Suivi de commande',
    'tracking.hero.desc': 'Entrez votre numéro de commande et votre e-mail pour connaître son statut en temps réel.',
    'tracking.orderNumber': 'Numéro de commande', 'tracking.email': 'E-mail',
    'tracking.submit': 'Suivre mon colis',
    'tracking.notFound': 'Aucune commande ne correspond à ce numéro et cet e-mail.',
    'tracking.trackingNumber': 'Numéro de suivi',
    'tracking.step.confirmed': 'Commande confirmée', 'tracking.step.preparing': 'En préparation',
    'tracking.step.shipped': 'Expédiée', 'tracking.step.delivered': 'Livrée',
    'loyalty.title': 'Carte de fidélité', 'loyalty.aria': 'Carte de fidélité', 'loyalty.points': 'points',
    'loyalty.tiersTitle': 'Récompenses', 'loyalty.maxed': 'Bravo, vous avez débloqué toutes les récompenses ! 🎉',
    'loyalty.viewCard': 'Voir ma carte de fidélité complète →',
    'loyalty.hero.title': 'Votre carte de fidélité BBVOLTEX',
    'loyalty.hero.desc': 'Cumulez des points à chaque commande (1 € dépensé = 1 point) et débloquez des récompenses automatiquement.',
    'loyalty.member': 'Membre BBVOLTEX', 'loyalty.memberNew': 'Nouveau membre',
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
    'error.generic': 'Un problème est survenu, réessayez.',
    'error.offline': 'Impossible de joindre le serveur BBVOLTEX. Vérifiez qu\'il tourne bien (npm start).',
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
    'shipping.exclusions': 'Les articles soldés à -50% ou plus, les sous-vêtements et les cadeaux personnalisés ne sont pas repris pour des raisons d\'hygiène.',

    'sizeguide.hero.title': 'Guide des tailles', 'sizeguide.hero.desc': 'Trouvez la taille idéale pour vos vêtements et chaussures, à chaque commande.',
    'sizeguide.adult.eyebrow': 'Homme &amp; Femme', 'sizeguide.adult.title': 'Vêtements adulte',
    'sizeguide.adult.desc': 'Mesures données à titre indicatif, en centimètres. En cas de doute entre deux tailles, préférez la taille supérieure.',
    'sizeguide.col.size': 'Taille', 'sizeguide.col.chestWomen': 'Tour de poitrine (Femme)', 'sizeguide.col.chestMen': 'Tour de poitrine (Homme)', 'sizeguide.col.waist': 'Tour de taille',
    'sizeguide.kids.eyebrow': 'Enfant', 'sizeguide.kids.title': 'Vêtements enfant',
    'sizeguide.kids.desc': 'Les tailles enfant sont indiquées par âge et par hauteur, pour un ajustement au plus près de la croissance.',
    'sizeguide.col.age': 'Âge', 'sizeguide.col.height': 'Hauteur',
    'sizeguide.age.0-1m': '0–1 mois', 'sizeguide.age.2-3m': '2–3 mois', 'sizeguide.age.6-9m': '6–9 mois',
    'sizeguide.age.1-4a': '1–4 ans', 'sizeguide.age.5-10a': '5–10 ans',
    'sizeguide.shoes.eyebrow': 'Chaussures', 'sizeguide.shoes.title': 'Pointures',
    'sizeguide.shoes.desc': 'Mesurez la longueur du pied en fin de journée, pieds légèrement écartés, pour plus de précision.',
    'sizeguide.col.eu': 'Pointure EU', 'sizeguide.col.footlength': 'Longueur du pied',
    'sizeguide.help': 'Un doute sur votre taille ? <a href="mailto:bbvoltex@gmail.com">Contactez-nous</a>, nous vous aidons à choisir.',

    'faq.hero.title': 'Questions fréquentes', 'faq.hero.desc': 'Les réponses aux questions les plus posées sur la livraison, les retours, le paiement et votre compte.',
    'faq.q1': 'Quels sont les délais et frais de livraison ?',
    'faq.a1': 'Livraison standard en 3 à 5 jours ouvrés (4,90 €, offerte dès 20 € d\'achat) ou express en 24 à 48h (9,90 €). Détails complets sur la page <a href="livraison-retours.html">Livraison &amp; retours</a>.',
    'faq.q2': 'Comment retourner un article ?',
    'faq.a2': 'Vous disposez de 30 jours après réception pour changer d\'avis, sans justification. Contactez-nous par e-mail pour recevoir votre étiquette de retour. Voir les conditions sur la page <a href="livraison-retours.html">Livraison &amp; retours</a>.',
    'faq.q3': 'Quels moyens de paiement acceptez-vous ?',
    'faq.a3': 'Carte bancaire (Visa, Mastercard), PayPal et Apple Pay, via un paiement 100% sécurisé.',
    'faq.q4': 'Comment suivre ma commande ?',
    'faq.a4': 'Rendez-vous sur la page <a href="suivi.html">Suivre ma commande</a> avec votre numéro de commande et l\'e-mail utilisé lors de l\'achat pour voir son statut en temps réel.',
    'faq.q5': 'Comment fonctionne la carte de fidélité ?',
    'faq.a5': 'Chaque euro dépensé vous rapporte 1 point. Vos points débloquent automatiquement des récompenses par palier. Détails sur votre <a href="carte-fidelite.html">carte de fidélité</a>.',
    'faq.q6': 'Puis-je personnaliser une boîte carton avec mon logo ?',
    'faq.a6': 'Oui, plusieurs formats de la rubrique <a href="box.html">Box</a> sont personnalisables avec votre logo, avec un délai de personnalisation de 5 à 7 jours ouvrés.',
    'faq.q7': 'Comment vous contacter ?',
    'faq.a7': 'Par e-mail à <a href="mailto:bbvoltex@gmail.com">bbvoltex@gmail.com</a>, nous répondons sous 48h ouvrées.',

    'histoire.hero.title': 'Notre histoire', 'histoire.hero.desc': 'D\'une exigence simple à une marketplace multi-univers : l\'histoire de BBVOLTEX.',
    'histoire.p1': 'BBVOLTEX est né d\'un constat simple : trouver des produits vraiment fiables, bien conçus et proposés à un prix juste demande souvent de comparer des dizaines de boutiques. Nous avons voulu rassembler cette exigence en un seul endroit.',
    'histoire.p2': 'Ce qui a commencé comme une sélection resserrée s\'est progressivement élargi : vêtements, électronique, maison, beauté, sport, et jusqu\'aux emballages professionnels de notre rubrique Box. À chaque nouvelle catégorie, le même principe : de vrais critères de qualité et de sécurité avant d\'ajouter un produit à notre catalogue.',
    'histoire.p3': 'Aujourd\'hui, BBVOLTEX continue de grandir avec la même conviction : proposer un catalogue large sans jamais sacrifier l\'exigence sur la qualité, la sécurité et le service.',
    'histoire.values.eyebrow': 'Nos valeurs', 'histoire.values.title': 'Ce qui guide chaque sélection',
    'histoire.value1.title': 'Sécurité', 'histoire.value1.desc': 'Chaque produit répond à des normes de sécurité vérifiées avant d\'entrer au catalogue.',
    'histoire.value2.title': 'Qualité', 'histoire.value2.desc': 'Des matériaux et des finitions choisis pour durer, pas pour être remplacés au bout de quelques mois.',
    'histoire.value3.title': 'Service', 'histoire.value3.desc': 'Une équipe joignable, un suivi de commande transparent et des retours simplifiés.',

    'eco.hero.title': 'Notre engagement éco-responsable', 'eco.hero.desc': 'Des choix concrets sur les matériaux, les emballages et nos partenaires, à chaque catégorie du catalogue.',
    'eco.materials.eyebrow': 'Matériaux', 'eco.materials.title': 'Des matières choisies avec soin',
    'eco.mat1.title': 'Bois FSC', 'eco.mat1.desc': 'Les jouets et objets en bois proviennent de forêts gérées durablement.',
    'eco.mat2.title': 'Coton biologique', 'eco.mat2.desc': 'Nos textiles en coton bio sont certifiés GOTS, sans traitements nocifs.',
    'eco.mat3.title': 'Carton recyclable', 'eco.mat3.desc': 'Les boîtes de la rubrique Box sont en carton kraft recyclable et compostable.',
    'eco.packaging.eyebrow': 'Emballages', 'eco.packaging.title': 'Moins de plastique, moins de déchets',
    'eco.packaging.desc': 'Nos colis sont expédiés dans des emballages en carton recyclé, sans suremballage inutile. Nous réduisons progressivement le plastique de calage au profit de matériaux recyclables ou compostables.',
    'eco.sourcing.eyebrow': 'Sourcing', 'eco.sourcing.title': 'Des partenaires sélectionnés',
    'eco.sourcing.desc': 'Nous privilégions des fournisseurs capables de justifier leurs certifications (FSC, GOTS, CE) et évaluons chaque nouveau partenaire sur ces critères avant toute mise en catalogue.',

    'securite.hero.title': 'Normes de sécurité', 'securite.hero.desc': 'Chaque catégorie répond à des exigences de sécurité vérifiées avant sa mise en vente.',
    'securite.q1': 'Jouets', 'securite.a1': 'Nos jouets sont conformes au marquage CE et à la norme européenne EN71, avec des pièces adaptées à l\'âge indiqué pour éviter tout risque d\'ingestion ou d\'étouffement.',
    'securite.q2': 'Vêtements &amp; textile', 'securite.a2': 'Nos textiles respectent les normes de sécurité CE pour le textile : absence de cordons dangereux, boutons-pression sans nickel, coutures contrôlées.',
    'securite.q3': 'Box &amp; emballages alimentaires', 'securite.a3': 'Les boîtes en carton de la rubrique Box sont fabriquées avec des matériaux conformes aux normes de contact alimentaire en vigueur.',
    'securite.q4': 'Électronique', 'securite.a4': 'Nos produits électroniques sont conformes au marquage CE et aux exigences européennes en matière de compatibilité électromagnétique et de restriction des substances dangereuses.',
    'securite.q5': 'Contrôle qualité', 'securite.a5': 'Chaque nouveau produit est vérifié avant sa mise en ligne : documentation de conformité, matériaux et finitions sont passés en revue avant d\'intégrer le catalogue.',

    'carrieres.hero.title': 'Carrières chez BBVOLTEX', 'carrieres.hero.desc': 'Une équipe à taille humaine, exigeante sur la qualité et le service.',
    'carrieres.why.eyebrow': 'Pourquoi nous rejoindre', 'carrieres.why.title': 'Une exigence partagée',
    'carrieres.why.desc': 'Chez BBVOLTEX, chaque personne de l\'équipe partage la même conviction : la qualité et la sécurité ne se négocient pas. Nous travaillons en petite équipe, avec des responsabilités concrètes dès le premier jour.',
    'carrieres.open.eyebrow': 'Postes ouverts', 'carrieres.open.title': 'Aucun poste ouvert pour le moment',
    'carrieres.open.desc': 'Nous n\'avons pas d\'offre active actuellement, mais nous étudions volontiers les candidatures spontanées.',
    'carrieres.cta': 'Envoyer une candidature spontanée →'
  },
  en: {
    'topbar.text': '🚚 Free delivery from €20 &nbsp;•&nbsp; ✨ -20% on sale items with code SOLEIL',
    'nav.home': 'Home', 'nav.toys': 'Toys', 'nav.clothing': 'Clothing', 'nav.brands': 'Jewelry & Accessories', 'nav.brands.l1': 'Jewelry', 'nav.brands.l2': 'Accessories', 'nav.sales': 'Sale 🔥',
    'nav.box': 'Box <svg width="16" height="16" viewBox="0 0 100 100" style="vertical-align:-2px;margin-left:2px;"><path d="M50 8 88 28 50 48 12 28Z" fill="#e8c896"/><path d="M12 28v42l38 22V50Z" fill="#c68642"/><path d="M88 28v42L50 92V50Z" fill="#9c6a34"/><path d="M44 31v61l6 3.5V34.5Z" fill="#d4af37"/></svg>', 'nav.box2': 'Box',
    'nav.categories': 'Categories ▾', 'nav.tech': 'Electronics', 'nav.home2': 'Home &amp; Decor',
    'nav.beauty': 'Beauty', 'nav.sport': 'Sport &amp; Leisure',
    'mega.kids': 'Kids', 'mega.home': 'Home &amp; Wellness', 'mega.techsport': 'Tech &amp; Sport',
    'electronique.hero.title': 'The Electronics universe',
    'electronique.hero.desc': 'Headphones, speakers and connected devices selected for their quality and everyday reliability.',
    'maison.hero.title': 'The Home &amp; Decor universe',
    'maison.hero.desc': 'Lighting, textiles and small handcrafted touches to elevate your home every day.',
    'beaute.hero.title': 'The Beauty &amp; Wellness universe',
    'beaute.hero.desc': 'Skincare and cosmetics formulated with natural ingredients, to take care of you every day.',
    'sport.hero.title': 'The Sport &amp; Leisure universe',
    'sport.hero.desc': 'Simple, durable gear to stay active at home or outdoors, at any age and any level.',
    'box.hero.title': 'Box — Packaging &amp; cardboard boxes',
    'box.hero.desc': 'Cardboard boxes designed for snacks and pastries, in small or large quantities, for individuals and small businesses alike.',
    'search.placeholder': 'Search for a toy, an outfit...',
    'hero.tag': '✨ Premium selection',
    'hero.title': 'Excellence at the service<br>of your <span class="highlight">everyday</span>',
    'hero.desc': 'Fashion, tech, home, beauty and sport: a rigorous selection of reliable products, delivered with total peace of mind.',
    'hero.cta1': 'Discover the shop', 'hero.cta2': 'View categories',
    'hero.stat1': 'happy customers', 'hero.stat2': 'secure payment', 'hero.stat3': 'average rating',
    'hero.visual1': 'Electronics', 'hero.visual2': 'Fashion', 'hero.visual3': 'Home',
    'categories.eyebrow': 'Explore', 'categories.title': 'All our categories',
    'categories.desc': 'One catalog for all your needs, curated with the same commitment to quality.',
    'sub.byage': 'By age', 'sub.byuniverse': 'By category',
    'sub.byage2': 'Filter by age', 'sub.byuniverse2': 'Filter by category',
    'age.0-2': '0–2 years', 'age.3-5': '3–5 years', 'age.6-12': '6–12 years',
    'uni.educatif.title': 'Educational toys', 'uni.educatif.desc': 'Learning through play',
    'uni.pleinair.title': 'Outdoor', 'uni.pleinair.desc': 'Outdoor adventures',
    'uni.homme.title': 'Men', 'uni.homme.desc': 'Men\'s wardrobe',
    'uni.femme.title': 'Women', 'uni.femme.desc': 'Women\'s wardrobe',
    'uni.enfant.title': 'Kids', 'uni.enfant.desc': 'Kids\' wardrobe',
    'uni.fille.title': 'Girls', 'uni.fille.desc': 'A soft, creative world',
    'uni.garcon.title': 'Boys', 'uni.garcon.desc': 'A world of action and discovery',
    'uni.bebe.title': 'Baby', 'uni.bebe.desc': 'Gentle first discoveries',
    'products.eyebrow': 'Favorites', 'products.title': 'Featured products',
    'products.desc': 'A rigorous selection across every category.',
    'search.eyebrow': 'Search results',
    'search.resultsFor': 'Results for "%s"',
    'search.resultsDesc': '%s product(s) found across the whole catalog.',
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
    'newsletter.title': 'Join the BBVOLTEX family 💌',
    'newsletter.desc': 'Get -10% on your first order and be first to know about new arrivals.',
    'newsletter.placeholder': 'Your email address', 'newsletter.button': 'Subscribe',
    'newsletter.success': 'Thanks for subscribing! 🎉 +10 loyalty points added.',
    'footer.shop': 'Shop', 'footer.destock': 'Clearance bundles', 'footer.service': 'Customer service',
    'footer.contact': 'Contact us', 'footer.shipping': 'Shipping &amp; returns',
    'footer.tracking': 'Track my order',
    'footer.sizeguide': 'Size guide', 'footer.faq': 'FAQ', 'footer.about': 'About',
    'footer.story': 'Our story', 'footer.eco': 'Eco-friendly commitment',
    'footer.safety': 'Safety standards', 'footer.careers': 'Careers',
    'footer.copy': '© 2026 BBVOLTEX — All rights reserved.',
    'breadcrumb.home': 'Home',
    'jouets.hero.title': 'The Toys collection',
    'jouets.hero.desc': 'Toys built to last and spark curiosity: fine materials, careful craftsmanship and uncompromising safety, for every age.',
    'vetements.hero.title': 'The Clothing collection',
    'vetements.hero.desc': 'Men, Women, Kids: clothing designed for comfort and style, for every age and every occasion.',
    'soldes.hero.title': 'BBVOLTEX Sale',
    'soldes.hero.desc': 'Up to -20% with code <strong>SOLEIL</strong> on a selection of products. It won\'t last, grab it now!',
    'soldes.destocklink': 'See clearance bundles →',
    'bijoux.hero.title': 'The Jewelry & Accessories universe',
    'bijoux.hero.desc': 'Necklaces, bracelets, rings, belts, watches and bags: pieces chosen for their quality, ready to personalize.',
    'uni.collier.title': 'Necklace', 'uni.collier.desc': 'Pendants & chains',
    'uni.bracelet.title': 'Bracelet', 'uni.bracelet.desc': 'Delicate or statement',
    'uni.bague.title': 'Ring', 'uni.bague.desc': 'Bands & solitaires',
    'uni.ceinture.title': 'Belt', 'uni.ceinture.desc': 'Leather & buckles',
    'uni.montre.title': 'Watch', 'uni.montre.desc': 'Classic & connected',
    'uni.sacamain.title': 'Women\'s handbag', 'uni.sacamain.desc': 'Everyday elegance',
    'uni.sacados.title': 'Crossbody / Backpack', 'uni.sacados.desc': 'Practical & on the go',
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
    'checkout.trackOrder': 'Track my order →',
    'tracking.title': 'Order tracking',
    'tracking.hero.title': 'Order tracking',
    'tracking.hero.desc': 'Enter your order number and e-mail to see its status in real time.',
    'tracking.orderNumber': 'Order number', 'tracking.email': 'E-mail',
    'tracking.submit': 'Track my package',
    'tracking.notFound': 'No order matches this number and e-mail.',
    'tracking.trackingNumber': 'Tracking number',
    'tracking.step.confirmed': 'Order confirmed', 'tracking.step.preparing': 'Being prepared',
    'tracking.step.shipped': 'Shipped', 'tracking.step.delivered': 'Delivered',
    'loyalty.title': 'Loyalty card', 'loyalty.aria': 'Loyalty card', 'loyalty.points': 'points',
    'loyalty.tiersTitle': 'Rewards', 'loyalty.maxed': 'Congrats, you\'ve unlocked every reward! 🎉',
    'loyalty.viewCard': 'See my full loyalty card →',
    'loyalty.hero.title': 'Your BBVOLTEX loyalty card',
    'loyalty.hero.desc': 'Earn points with every order (€1 spent = 1 point) and unlock rewards automatically.',
    'loyalty.member': 'BBVOLTEX member', 'loyalty.memberNew': 'New member',
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
    'error.generic': 'Something went wrong, please try again.',
    'error.offline': 'Could not reach the BBVOLTEX server. Make sure it is running (npm start).',
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
    'shipping.exclusions': 'Items on sale at -50% or more, underwear and personalized gifts cannot be returned for hygiene reasons.',

    'sizeguide.hero.title': 'Size guide', 'sizeguide.hero.desc': 'Find the perfect size for your clothes and shoes, for every order.',
    'sizeguide.adult.eyebrow': 'Men &amp; Women', 'sizeguide.adult.title': 'Adult clothing',
    'sizeguide.adult.desc': 'Measurements given for guidance, in centimeters. If in doubt between two sizes, choose the larger one.',
    'sizeguide.col.size': 'Size', 'sizeguide.col.chestWomen': 'Bust (Women)', 'sizeguide.col.chestMen': 'Chest (Men)', 'sizeguide.col.waist': 'Waist',
    'sizeguide.kids.eyebrow': 'Kids', 'sizeguide.kids.title': 'Kids\' clothing',
    'sizeguide.kids.desc': 'Kids\' sizes are shown by age and height, for a fit that follows growth closely.',
    'sizeguide.col.age': 'Age', 'sizeguide.col.height': 'Height',
    'sizeguide.age.0-1m': '0–1 month', 'sizeguide.age.2-3m': '2–3 months', 'sizeguide.age.6-9m': '6–9 months',
    'sizeguide.age.1-4a': '1–4 years', 'sizeguide.age.5-10a': '5–10 years',
    'sizeguide.shoes.eyebrow': 'Shoes', 'sizeguide.shoes.title': 'Shoe sizes',
    'sizeguide.shoes.desc': 'Measure your foot length at the end of the day, feet slightly apart, for better accuracy.',
    'sizeguide.col.eu': 'EU size', 'sizeguide.col.footlength': 'Foot length',
    'sizeguide.help': 'Not sure about your size? <a href="mailto:bbvoltex@gmail.com">Contact us</a>, we\'ll help you choose.',

    'faq.hero.title': 'Frequently asked questions', 'faq.hero.desc': 'Answers to the most common questions about delivery, returns, payment and your account.',
    'faq.q1': 'What are the delivery times and fees?',
    'faq.a1': 'Standard delivery in 3 to 5 business days (€4.90, free from €20 of purchase) or express in 24 to 48h (€9.90). Full details on the <a href="livraison-retours.html">Shipping &amp; returns</a> page.',
    'faq.q2': 'How do I return an item?',
    'faq.a2': 'You have 30 days after receipt to change your mind, no reason needed. Contact us by email to receive your return label. See the terms on the <a href="livraison-retours.html">Shipping &amp; returns</a> page.',
    'faq.q3': 'Which payment methods do you accept?',
    'faq.a3': 'Credit card (Visa, Mastercard), PayPal and Apple Pay, via 100% secure payment.',
    'faq.q4': 'How do I track my order?',
    'faq.a4': 'Go to the <a href="suivi.html">Track my order</a> page with your order number and the email used at checkout to see its status in real time.',
    'faq.q5': 'How does the loyalty card work?',
    'faq.a5': 'Every euro spent earns you 1 point. Your points automatically unlock rewards by tier. Details on your <a href="carte-fidelite.html">loyalty card</a>.',
    'faq.q6': 'Can I customize a cardboard box with my logo?',
    'faq.a6': 'Yes, several formats in the <a href="box.html">Box</a> section can be customized with your logo, with a 5 to 7 business day customization lead time.',
    'faq.q7': 'How can I contact you?',
    'faq.a7': 'By email at <a href="mailto:bbvoltex@gmail.com">bbvoltex@gmail.com</a>, we reply within 48 business hours.',

    'histoire.hero.title': 'Our story', 'histoire.hero.desc': 'From a simple requirement to a multi-category marketplace: the story of BBVOLTEX.',
    'histoire.p1': 'BBVOLTEX was born from a simple observation: finding products that are truly reliable, well designed and fairly priced often means comparing dozens of shops. We wanted to bring that standard together in one place.',
    'histoire.p2': 'What started as a tight selection gradually grew: clothing, electronics, home, beauty, sport, and even the professional packaging in our Box section. With every new category, the same principle: real quality and safety criteria before any product joins our catalog.',
    'histoire.p3': 'Today, BBVOLTEX keeps growing with the same conviction: offer a wide catalog without ever compromising on quality, safety and service.',
    'histoire.values.eyebrow': 'Our values', 'histoire.values.title': 'What guides every selection',
    'histoire.value1.title': 'Safety', 'histoire.value1.desc': 'Every product meets verified safety standards before joining the catalog.',
    'histoire.value2.title': 'Quality', 'histoire.value2.desc': 'Materials and finishes chosen to last, not to be replaced after a few months.',
    'histoire.value3.title': 'Service', 'histoire.value3.desc': 'A reachable team, transparent order tracking and simplified returns.',

    'eco.hero.title': 'Our eco-friendly commitment', 'eco.hero.desc': 'Concrete choices on materials, packaging and our partners, across every category of the catalog.',
    'eco.materials.eyebrow': 'Materials', 'eco.materials.title': 'Carefully chosen materials',
    'eco.mat1.title': 'FSC wood', 'eco.mat1.desc': 'Wooden toys and objects come from sustainably managed forests.',
    'eco.mat2.title': 'Organic cotton', 'eco.mat2.desc': 'Our organic cotton textiles are GOTS-certified, free of harmful treatments.',
    'eco.mat3.title': 'Recyclable cardboard', 'eco.mat3.desc': 'The boxes in our Box section are made of recyclable, compostable kraft cardboard.',
    'eco.packaging.eyebrow': 'Packaging', 'eco.packaging.title': 'Less plastic, less waste',
    'eco.packaging.desc': 'Our parcels are shipped in recycled cardboard packaging, with no unnecessary over-packaging. We are progressively reducing plastic filler in favor of recyclable or compostable materials.',
    'eco.sourcing.eyebrow': 'Sourcing', 'eco.sourcing.title': 'Carefully selected partners',
    'eco.sourcing.desc': 'We favor suppliers who can document their certifications (FSC, GOTS, CE) and assess every new partner against these criteria before adding them to the catalog.',

    'securite.hero.title': 'Safety standards', 'securite.hero.desc': 'Every category meets verified safety requirements before going on sale.',
    'securite.q1': 'Toys', 'securite.a1': 'Our toys comply with CE marking and the European EN71 standard, with parts suited to the stated age to avoid any risk of ingestion or choking.',
    'securite.q2': 'Clothing &amp; textiles', 'securite.a2': 'Our textiles meet CE textile safety standards: no hazardous cords, nickel-free snap buttons, checked seams.',
    'securite.q3': 'Box &amp; food packaging', 'securite.a3': 'The cardboard boxes in our Box section are made with materials compliant with current food contact standards.',
    'securite.q4': 'Electronics', 'securite.a4': 'Our electronic products comply with CE marking and European requirements on electromagnetic compatibility and restriction of hazardous substances.',
    'securite.q5': 'Quality control', 'securite.a5': 'Every new product is checked before going live: compliance documentation, materials and finishes are reviewed before joining the catalog.',

    'carrieres.hero.title': 'Careers at BBVOLTEX', 'carrieres.hero.desc': 'A human-sized team, demanding on quality and service.',
    'carrieres.why.eyebrow': 'Why join us', 'carrieres.why.title': 'A shared standard',
    'carrieres.why.desc': 'At BBVOLTEX, everyone on the team shares the same conviction: quality and safety are non-negotiable. We work as a small team, with real responsibilities from day one.',
    'carrieres.open.eyebrow': 'Open positions', 'carrieres.open.title': 'No open positions right now',
    'carrieres.open.desc': 'We have no active listing at the moment, but we\'re happy to consider spontaneous applications.',
    'carrieres.cta': 'Send a spontaneous application →'
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
  searchTerm: new URLSearchParams(location.search).get('q') || '',
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

function hasPhoto(p) {
  return !!((p.images && p.images.length) || p.image);
}

function productVisual(p) {
  const src = p.images && p.images.length ? p.images[0] : p.image;
  return src ? `<img class="product-photo" src="${src}" alt="" loading="lazy">` : p.icon;
}

function modalImageMarkup(p, index) {
  // No loading="lazy" here: this image is the focal point of a modal that
  // just appeared via a CSS opacity/visibility toggle, not real scrolling —
  // Firefox's native lazy-load never detects it as "in view" in that case
  // and the fetch gets aborted (NS_BINDING_ABORTED), leaving it blank forever.
  if (p.images && p.images.length) return `<img src="${p.images[index] || p.images[0]}" alt="">`;
  return productVisual(p);
}

function renderModalPhotoThumbs(p) {
  const wrap = document.getElementById('modalPhotoThumbs');
  if (!wrap) return;
  if (p.images && p.images.length > 1) {
    wrap.hidden = false;
    wrap.innerHTML = p.images.map((img, i) => `<button type="button" class="photo-thumb ${i === 0 ? 'selected' : ''}" data-photo-index="${i}" aria-label="Photo ${i + 1}"><img src="${img}" alt=""></button>`).join('');
  } else {
    wrap.hidden = true;
    wrap.innerHTML = '';
  }
}

const CATEGORY_LABEL_KEYS = {
  jouets: 'nav.toys', vetements: 'nav.clothing', electronique: 'nav.tech',
  maison: 'nav.home2', beaute: 'nav.beauty', sport: 'nav.sport',
  bijoux: 'nav.brands', box: 'nav.box2', destockage: 'footer.destock'
};

/* ===================== RENDER PRODUCTS ===================== */
function getFilteredProducts() {
  // A search term is a universal, cross-category lookup (like a marketplace
  // search bar): it overrides the page's own category/age/universe filters
  // instead of narrowing them further, so a search always finds a matching
  // product regardless of which page or category it lives in.
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase();
    return PRODUCTS.filter(p => {
      const categoryLabel = CATEGORY_LABEL_KEYS[p.category] ? t(CATEGORY_LABEL_KEYS[p.category]) : '';
      return pf(p, 'name').toLowerCase().includes(term)
        || pf(p, 'description').toLowerCase().includes(term)
        || pf(p, 'ageLabel').toLowerCase().includes(term)
        || p.category.toLowerCase().includes(term)
        || categoryLabel.toLowerCase().includes(term);
    });
  }
  return PRODUCTS.filter(p => {
    if (state.categoryFilter === 'soldes' && !p.sale) return false;
    if (state.categoryFilter !== 'all' && state.categoryFilter !== 'soldes' && p.category !== state.categoryFilter) return false;
    if (state.ageFilter && p.age !== state.ageFilter && p.age !== 'all') return false;
    if (state.universeFilter && p.universe !== state.universeFilter) return false;
    return true;
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const empty = document.getElementById('emptyState');
  const list = getFilteredProducts();
  grid.innerHTML = '';
  grid.classList.toggle('is-grouped', !!state.searchTerm);
  if (empty) empty.hidden = list.length !== 0;

  // Reflect the "universal search" state in the products section heading,
  // and hide the category chips since a search overrides them anyway.
  const eyebrow = document.getElementById('productsEyebrow');
  const title = document.getElementById('productsTitle');
  const desc = document.getElementById('productsDesc');
  const chips = document.getElementById('filterChips');
  if (title) {
    if (state.searchTerm) {
      if (eyebrow) eyebrow.textContent = t('search.eyebrow');
      title.textContent = t('search.resultsFor').replace('%s', state.searchTerm);
      if (desc) desc.textContent = t('search.resultsDesc').replace('%s', list.length);
      if (chips) chips.hidden = true;
    } else {
      if (eyebrow) eyebrow.textContent = t('products.eyebrow');
      title.textContent = t('products.title');
      if (desc) desc.textContent = t('products.desc');
      if (chips) chips.hidden = false;
    }
  }

  const buildCardEl = (p) => {
    const isFav = state.favorites.includes(p.id);
    const badge = p.lot
      ? `<span class="product-badge lot-badge">${t('badge.lot')}</span>`
      : (p.sale ? `<span class="product-badge">${t('badge.sale')}</span>` : '');
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-media ${hasPhoto(p) ? 'has-photo' : ''}" style="--product-bg:${p.bg}" data-open="${p.id}">
        ${badge}
        <button class="product-fav ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="${isFav ? t('fav.removeAria') : t('fav.addAria')}" aria-pressed="${isFav}">${isFav ? '❤️' : '🤍'}</button>
        ${hasPhoto(p) ? productVisual(p) : `<div class="product-icon">${p.icon}</div>`}
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
    if (hasPhoto(p)) wireImageRetry(card.querySelector('.product-media'), p);
    return card;
  };

  if (state.searchTerm) {
    // Search spans every category, so results are grouped under a heading
    // per category instead of one undifferentiated grid.
    const order = ['jouets', 'vetements', 'maison', 'beaute', 'electronique', 'sport', 'bijoux', 'box', 'destockage'];
    const byCategory = new Map();
    list.forEach(p => {
      if (!byCategory.has(p.category)) byCategory.set(p.category, []);
      byCategory.get(p.category).push(p);
    });
    order.filter(cat => byCategory.has(cat)).forEach(cat => {
      const group = document.createElement('div');
      group.className = 'search-category-group';
      const heading = document.createElement('h3');
      heading.className = 'search-category-heading';
      heading.textContent = CATEGORY_LABEL_KEYS[cat] ? t(CATEGORY_LABEL_KEYS[cat]) : cat;
      group.appendChild(heading);
      const subGrid = document.createElement('div');
      subGrid.className = 'product-grid';
      byCategory.get(cat).forEach(p => subGrid.appendChild(buildCardEl(p)));
      group.appendChild(subGrid);
      grid.appendChild(group);
    });
  } else {
    list.forEach(p => grid.appendChild(buildCardEl(p)));
  }
}

/* ===================== MODAL ===================== */
// The modal photo has been observed to sometimes fail to load (aborted
// request) for reasons that don't reproduce locally. Rather than depend on
// diagnosing that further, make it self-healing: retry a few times with a
// cache-busting query so a fresh request is made each time, then fall back
// to the drawn icon if it still won't load, instead of staying blank forever.
function wireImageRetry(container, p) {
  const img = container.querySelector('img');
  if (!img) return;
  let attempts = 0;
  let settled = false;
  const maxAttempts = 4;
  const baseSrc = img.getAttribute('src').split('?')[0];

  const retry = () => {
    if (settled) return;
    attempts++;
    if (attempts <= maxAttempts) {
      setTimeout(() => {
        if (!settled) img.src = `${baseSrc}?retry=${attempts}-${Date.now()}`;
      }, attempts * 400);
    } else {
      settled = true;
      container.innerHTML = p.icon;
    }
  };

  img.addEventListener('load', () => { settled = true; });
  img.addEventListener('error', retry);
  // A silently aborted request (e.g. NS_BINDING_ABORTED) doesn't always fire
  // "error" — if nothing has happened after a few seconds, retry anyway.
  setTimeout(() => { if (!settled && !img.complete) retry(); }, 3000);
}

function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const alreadyOpen = document.getElementById('productModal').classList.contains('open');
  if (!alreadyOpen) lastFocusedElement = document.activeElement;
  state.currentModalProduct = p;
  state.currentModalColor = p.colors[0];
  state.currentModalPhotoIndex = 0;

  const modalImageEl = document.getElementById('modalImage');
  modalImageEl.innerHTML = modalImageMarkup(p, 0);
  modalImageEl.style.background = p.bg;
  modalImageEl.classList.toggle('zoomable', hasPhoto(p));
  wireImageRetry(modalImageEl, p);
  renderModalPhotoThumbs(p);
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

  const descriptionHtml = pf(p, 'description').split('\n\n').map(para => `<p>${para}</p>`).join('');
  document.getElementById('panelDescription').innerHTML = `
    ${descriptionHtml}
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
        <div class="cart-item-media" style="background:${p.bg}">${productVisual(p)}</div>
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
      <div class="cart-item-media" style="background:${p.bg}">${productVisual(p)}</div>
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

/* ===================== ORDER TRACKING ===================== */
/* Renders the step-by-step timeline returned by GET /api/track on suivi.html.
   No-op if the page doesn't have the tracking result panel. */
function renderTrackingResult(data) {
  const result = document.getElementById('trackResult');
  if (!result) return;
  document.getElementById('trackResultOrder').textContent = data.orderNumber;

  const numberEl = document.getElementById('trackResultNumber');
  if (data.trackingNumber) {
    numberEl.textContent = `${t('tracking.trackingNumber')} : ${data.trackingNumber}`;
    numberEl.hidden = false;
  } else {
    numberEl.hidden = true;
  }

  const locale = state.lang === 'en' ? 'en-GB' : 'fr-FR';
  document.getElementById('trackSteps').innerHTML = data.steps.map(step => {
    const date = new Date(step.date).toLocaleDateString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `<li class="tracking-step ${step.done ? 'done' : ''}">
      <h4>${t('tracking.step.' + step.key)}</h4>
      <p>${step.done ? date : ''}</p>
    </li>`;
  }).join('');

  result.hidden = false;
  document.getElementById('trackError').hidden = true;
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

  if (order.email) {
    try {
      sessionStorage.setItem('bbvoltex_last_order', JSON.stringify({ orderNumber: order.orderNumber, email: order.email }));
    } catch (_) { /* private browsing or storage disabled — tracking link still works, just without prefill */ }
  }
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
    console.error('BBVOLTEX API unreachable:', err);
    showToast(t('error.offline'));
  }

  applyLanguage();

  // A search redirects here from another page with the results as the whole
  // point of the visit — jump straight to them instead of leaving the visitor
  // stranded at the top, behind the hero banner and category tiles.
  if (state.searchTerm) {
    const resultsSection = document.getElementById('produits');
    if (resultsSection) resultsSection.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

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

  // Search — acts as a universal, cross-category search (like a marketplace
  // search bar): typing live-filters when already on the homepage (where the
  // full catalog is browsable), and submitting from any other page jumps to
  // the homepage with the results, since that's the only page whose product
  // grid is meant to show items from every category at once.
  const isHome = document.getElementById('productGrid') && document.getElementById('filterChips');
  const doSearch = (val) => {
    state.searchTerm = val;
    renderProducts();
  };
  const goToSearchResults = (val) => {
    if (!val.trim()) return;
    window.location.href = 'index.html?q=' + encodeURIComponent(val.trim());
  };
  let searchDebounceTimer = null;
  [document.getElementById('searchInput'), document.getElementById('searchInputMobile')].forEach(input => {
    if (!input) return;
    input.value = state.searchTerm;
    input.addEventListener('input', (e) => {
      if (isHome) {
        doSearch(e.target.value);
      } else {
        // On category/other pages there's no cross-category grid to live-filter,
        // so typing alone did nothing until Enter was pressed — which felt like
        // a broken search bar. Auto-navigate to results after a short pause,
        // so search works the same way no matter which page it's used from.
        clearTimeout(searchDebounceTimer);
        const val = e.target.value;
        if (val.trim()) {
          searchDebounceTimer = setTimeout(() => goToSearchResults(val), 700);
        }
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchDebounceTimer);
        goToSearchResults(e.target.value);
      }
    });
  });
  document.querySelector('.search-bar button')?.addEventListener('click', () => {
    goToSearchResults(document.getElementById('searchInput').value);
  });

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

  const modalPhotoThumbsEl = document.getElementById('modalPhotoThumbs');
  if (modalPhotoThumbsEl) {
    modalPhotoThumbsEl.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-photo-index]');
      if (!thumb) return;
      const p = state.currentModalProduct;
      if (!p) return;
      const index = parseInt(thumb.dataset.photoIndex, 10);
      state.currentModalPhotoIndex = index;
      document.getElementById('modalImage').innerHTML = modalImageMarkup(p, index);
      modalPhotoThumbsEl.querySelectorAll('.photo-thumb').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
    });
  }

  // Let shoppers zoom into a real product photo to check quality/detail,
  // like clicking the main image on any serious e-commerce PDP. They can
  // still flip between photos while zoomed, via arrows or the keyboard.
  const imageLightbox = document.getElementById('imageLightbox');
  const modalImageEl2 = document.getElementById('modalImage');
  const lightboxImg = document.getElementById('imageLightboxImg');
  const lightboxPrev = document.getElementById('imageLightboxPrev');
  const lightboxNext = document.getElementById('imageLightboxNext');
  let lightboxIndex = 0;

  const showLightboxPhoto = (index) => {
    const p = state.currentModalProduct;
    if (!p || !p.images || !p.images.length) return;
    lightboxIndex = (index + p.images.length) % p.images.length;
    lightboxImg.src = p.images[lightboxIndex];
    const multi = p.images.length > 1;
    if (lightboxPrev) lightboxPrev.hidden = !multi;
    if (lightboxNext) lightboxNext.hidden = !multi;
  };

  if (imageLightbox && modalImageEl2) {
    modalImageEl2.addEventListener('click', () => {
      if (!modalImageEl2.classList.contains('zoomable')) return;
      showLightboxPhoto(state.currentModalPhotoIndex || 0);
      imageLightbox.classList.add('open');
    });
    const closeLightbox = () => imageLightbox.classList.remove('open');
    imageLightbox.addEventListener('click', closeLightbox);
    document.getElementById('imageLightboxClose')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
    lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); showLightboxPhoto(lightboxIndex - 1); });
    lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); showLightboxPhoto(lightboxIndex + 1); });
    document.addEventListener('keydown', (e) => {
      if (!imageLightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightboxPhoto(lightboxIndex - 1);
      if (e.key === 'ArrowRight') showLightboxPhoto(lightboxIndex + 1);
    });
  }

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

  const trackForm = document.getElementById('trackForm');
  if (trackForm) {
    const orderInput = document.getElementById('trackOrderNumber');
    const emailInput = document.getElementById('trackEmail');
    try {
      const last = JSON.parse(sessionStorage.getItem('bbvoltex_last_order'));
      if (last && last.orderNumber) {
        orderInput.value = last.orderNumber;
        emailInput.value = last.email || '';
      }
    } catch (_) { /* no prefill available — the visitor can still type it in manually */ }

    trackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = trackForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        const data = await apiFetch(`/track?order=${encodeURIComponent(orderInput.value.trim())}&email=${encodeURIComponent(emailInput.value.trim())}`);
        renderTrackingResult(data);
      } catch (err) {
        document.getElementById('trackResult').hidden = true;
        const errorEl = document.getElementById('trackError');
        errorEl.textContent = err.message || t('tracking.notFound');
        errorEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // Sticky header shrink on scroll (subtle)
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });
});
