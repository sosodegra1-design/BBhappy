/* ===================== DATA ===================== */
const PRODUCTS = [
  {
    id: 'p1',
    name: 'Camion en bois éducatif',
    category: 'jouets',
    universe: 'educatif',
    age: '0-2',
    ageLabel: '0-2 ans',
    price: 29.9,
    oldPrice: null,
    emoji: '🚚',
    bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066', '#ffcab1'],
    sale: false,
    description: 'Camion en bois de hêtre massif, poncé et verni à l\'eau pour une prise en main tout en douceur. Conçu pour stimuler la motricité fine et l\'imagination dès le plus jeune âge.',
    ecoDetails: 'Bois issu de forêts gérées durablement (certification FSC), peintures à base d\'eau non toxiques, zéro plastique dans l\'emballage.',
    safety: 'Conforme à la norme européenne de sécurité des jouets CE EN71. Pièces arrondies, sans petites pièces détachables.',
    care: 'Nettoyer avec un chiffon légèrement humide. Ne pas immerger dans l\'eau. Éviter l\'exposition prolongée au soleil direct.',
    sizeGuide: [ ['Âge', 'Longueur', 'Poids max'], ['0-2 ans', '22 cm', '2 kg'] ]
  },
  {
    id: 'p2',
    name: 'Peluche câline "Nuage"',
    category: 'jouets',
    universe: 'educatif',
    age: '0-2',
    ageLabel: '0-2 ans',
    price: 19.9,
    oldPrice: 24.9,
    emoji: '🧸',
    bg: '#ffe6a7',
    colors: ['#ffffff', '#ffcab1', '#a8e6cf'],
    sale: true,
    description: 'Une peluche moelleuse en forme de petit ours, idéale pour accompagner les siestes et calmer les premières nuits. Douceur incomparable garantie.',
    ecoDetails: 'Fourrure en coton bio recyclé, rembourrage en fibres recyclées certifiées OEKO-TEX.',
    safety: 'Conforme CE EN71, lavable en machine, yeux brodés (aucune petite pièce à avaler).',
    care: 'Lavage en machine à 30°C, cycle délicat. Séchage à l\'air libre uniquement, ne pas repasser.',
    sizeGuide: [ ['Taille', 'Hauteur'], ['Unique', '28 cm'] ]
  },
  {
    id: 'p3',
    name: 'Body manches longues bio',
    category: 'vetements',
    universe: 'coton-bio',
    age: '0-2',
    ageLabel: '0-2 ans',
    price: 14.9,
    oldPrice: null,
    emoji: '👶',
    bg: '#ffd6c9',
    colors: ['#ffffff', '#ffe066', '#a8e6cf', '#ffcab1'],
    sale: false,
    description: 'Body en jersey de coton biologique, doux et respirant pour la peau sensible des bébés. Coutures plates pour un confort maximal.',
    ecoDetails: '100% coton biologique certifié GOTS, colorants naturels sans substances nocives.',
    safety: 'Conforme aux normes de sécurité textile CE, sans pressions métalliques dangereuses.',
    care: 'Lavage en machine à 40°C. Repassage doux si besoin. Éviter l\'assouplissant qui réduit l\'absorption du coton.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['50', '0-1 mois', '50 cm'], ['62', '2-3 mois', '62 cm'], ['74', '6-9 mois', '74 cm'], ['86', '12-18 mois', '86 cm'] ]
  },
  {
    id: 'p4',
    name: 'Ciré de pluie jaune soleil',
    category: 'vetements',
    universe: 'plein-air',
    age: '3-5',
    ageLabel: '3-5 ans',
    price: 34.9,
    oldPrice: 39.9,
    emoji: '🧥',
    bg: '#ffe066',
    colors: ['#ffe066', '#a8e6cf', '#ffcab1'],
    sale: true,
    description: 'Ciré imperméable et léger pour braver la pluie avec le sourire. Capuche ajustable et bandes réfléchissantes pour plus de visibilité.',
    ecoDetails: 'PU sans phtalates, fabrication avec réduction de consommation d\'eau à la teinture.',
    safety: 'Conforme CE, boutons-pression sans nickel, cordon de capuche sécurisé (détachable).',
    care: 'Essuyer avec un chiffon humide. Ne pas laver en machine, ne pas repasser.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['98', '3 ans', '98 cm'], ['104', '4 ans', '104 cm'], ['110', '5 ans', '110 cm'] ]
  },
  {
    id: 'p5',
    name: 'Puzzle animaux de la forêt',
    category: 'jouets',
    universe: 'educatif',
    age: '3-5',
    ageLabel: '3-5 ans',
    price: 16.9,
    oldPrice: null,
    emoji: '🧩',
    bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066'],
    sale: false,
    description: 'Puzzle en bois de 24 pièces illustrant les animaux de la forêt, pour développer la logique et la reconnaissance des formes.',
    ecoDetails: 'Bois FSC, encres végétales, emballage en carton recyclé sans plastique.',
    safety: 'Conforme CE EN71, pièces surdimensionnées empêchant l\'ingestion.',
    care: 'Dépoussiérer avec un chiffon sec. Ne pas mouiller.',
    sizeGuide: [ ['Âge', 'Nombre de pièces'], ['3-5 ans', '24 pièces'] ]
  },
  {
    id: 'p6',
    name: 'Cerf-volant arc-en-ciel',
    category: 'jouets',
    universe: 'plein-air',
    age: '6-12',
    ageLabel: '6-12 ans',
    price: 22.9,
    oldPrice: null,
    emoji: '🪁',
    bg: '#d8e4ff',
    colors: ['#ffcab1', '#a8e6cf', '#ffe066'],
    sale: false,
    description: 'Cerf-volant facile à faire voler dès les premiers essais, avec toile résistante et couleurs vives pour illuminer le ciel.',
    ecoDetails: 'Toile en polyester recyclé, structure en fibre de verre légère.',
    safety: 'Conforme CE, cordage renforcé de 30m avec poignée ergonomique anti-coupure.',
    care: 'Sécher complètement avant rangement pour éviter les moisissures. Plier délicatement.',
    sizeGuide: [ ['Âge recommandé', 'Envergure'], ['6-12 ans', '90 cm'] ]
  },
  {
    id: 'p7',
    name: 'Baskets confort coton',
    category: 'vetements',
    universe: 'chaussures',
    age: '3-5',
    ageLabel: '3-5 ans',
    price: 27.9,
    oldPrice: 32.9,
    emoji: '👟',
    bg: '#d8e4ff',
    colors: ['#ffffff', '#a8e6cf', '#ffcab1'],
    sale: true,
    description: 'Baskets légères en toile de coton avec semelle souple, parfaites pour les premiers pas et les longues journées de jeu.',
    ecoDetails: 'Toile en coton bio, semelle en caoutchouc naturel, colle sans solvants.',
    safety: 'Conforme CE, semelle antidérapante testée, fermeture scratch sécurisée.',
    care: 'Lavage à la main à l\'eau froide. Laisser sécher à plat, à l\'air libre.',
    sizeGuide: [ ['Pointure', 'Âge', 'Longueur pied'], ['24', '3 ans', '15 cm'], ['26', '4 ans', '16 cm'], ['28', '5 ans', '17 cm'] ]
  },
  {
    id: 'p8',
    name: 'Robot à construire en bois',
    category: 'jouets',
    universe: 'educatif',
    age: '6-12',
    ageLabel: '6-12 ans',
    price: 24.9,
    oldPrice: null,
    emoji: '🤖',
    bg: '#c7f0db',
    colors: ['#a8e6cf', '#ffe066', '#ffcab1'],
    sale: false,
    description: 'Kit de construction en bois pour assembler son propre robot, sans colle ni outils. Développe la patience et la logique spatiale.',
    ecoDetails: 'Bois de bouleau FSC, pièces à assembler par emboîtement, zéro colle chimique.',
    safety: 'Conforme CE EN71, recommandé à partir de 6 ans (petites pièces).',
    care: 'Nettoyage avec un chiffon sec uniquement.',
    sizeGuide: [ ['Âge', 'Pièces', 'Hauteur assemblée'], ['6-12 ans', '32 pièces', '18 cm'] ]
  },
  {
    id: 'p9',
    name: 'Pull tricot col rond',
    category: 'vetements',
    universe: 'coton-bio',
    age: '6-12',
    ageLabel: '6-12 ans',
    price: 21.9,
    oldPrice: null,
    emoji: '🧶',
    bg: '#ffd6c9',
    colors: ['#ffcab1', '#a8e6cf', '#ffffff'],
    sale: false,
    description: 'Pull tricoté en coton biologique, chaud et confortable pour affronter les journées fraîches sans renoncer au style.',
    ecoDetails: '100% coton bio certifié GOTS, teintures végétales, production locale.',
    safety: 'Conforme aux normes textiles CE, sans cordons ni éléments détachables dangereux.',
    care: 'Lavage en machine à 30°C, cycle laine. Séchage à plat, ne pas mettre au sèche-linge.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['104', '3-4 ans', '104 cm'], ['116', '5-6 ans', '116 cm'], ['128', '7-8 ans', '128 cm'], ['140', '9-10 ans', '140 cm'] ]
  },
  {
    id: 'p10',
    name: 'Trottinette pliable 3 roues',
    category: 'jouets',
    universe: 'plein-air',
    age: '3-5',
    ageLabel: '3-5 ans',
    price: 44.9,
    oldPrice: 54.9,
    emoji: '🛴',
    bg: '#ffe6a7',
    colors: ['#ffe066', '#ffcab1', '#a8e6cf'],
    sale: true,
    description: 'Trottinette stable à 3 roues avec guidon ajustable en hauteur, pliable pour un rangement facile et un transport pratique.',
    ecoDetails: 'Structure en aluminium recyclable, emballage 100% carton.',
    safety: 'Conforme CE, frein arrière, roues silencieuses anti-choc, hauteur ajustable pour une croissance en sécurité.',
    care: 'Essuyer avec un chiffon sec. Vérifier régulièrement le serrage des vis.',
    sizeGuide: [ ['Âge', 'Hauteur guidon', 'Poids max'], ['3-5 ans', '56-68 cm', '20 kg'] ]
  },
  {
    id: 'p11',
    name: 'Doudou lapin bio',
    category: 'jouets',
    universe: 'educatif',
    age: '0-2',
    ageLabel: '0-2 ans',
    price: 12.9,
    oldPrice: null,
    emoji: '🐰',
    bg: '#ffe6a7',
    colors: ['#ffffff', '#ffcab1'],
    sale: false,
    description: 'Petit doudou lapin tout doux avec étiquettes sensorielles, parfait compagnon pour les tout-petits en quête de réconfort.',
    ecoDetails: 'Coton bio certifié GOTS, rembourrage hypoallergénique.',
    safety: 'Conforme CE EN71, lavable en machine, aucune petite pièce.',
    care: 'Lavage en machine à 30°C. Séchage à l\'air libre.',
    sizeGuide: [ ['Taille', 'Hauteur'], ['Unique', '20 cm'] ]
  },
  {
    id: 'p12',
    name: 'Legging coton bio motifs',
    category: 'vetements',
    universe: 'coton-bio',
    age: '3-5',
    ageLabel: '3-5 ans',
    price: 13.9,
    oldPrice: 17.9,
    emoji: '🩳',
    bg: '#ffd6c9',
    colors: ['#a8e6cf', '#ffcab1', '#ffe066'],
    sale: true,
    description: 'Legging extensible en coton biologique avec motifs ludiques, taille élastiquée pour un confort optimal toute la journée.',
    ecoDetails: '95% coton bio, 5% élasthanne, encres d\'impression sans substances nocives.',
    safety: 'Conforme aux normes textiles CE.',
    care: 'Lavage en machine à 30°C. Sèche-linge basse température autorisé.',
    sizeGuide: [ ['Taille', 'Âge', 'Hauteur'], ['98', '3 ans', '98 cm'], ['104', '4 ans', '104 cm'], ['110', '5 ans', '110 cm'] ]
  }
];

/* ===================== STATE ===================== */
const state = {
  categoryFilter: 'all',
  ageFilter: null,
  universeFilter: null,
  searchTerm: '',
  cart: JSON.parse(localStorage.getItem('bbhappy_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('bbhappy_favorites') || '[]'),
  currentModalProduct: null,
  currentModalColor: null
};

const fmtPrice = (n) => n.toFixed(2).replace('.', ',') + ' €';
const saveState = () => {
  localStorage.setItem('bbhappy_cart', JSON.stringify(state.cart));
  localStorage.setItem('bbhappy_favorites', JSON.stringify(state.favorites));
};

/* ===================== RENDER PRODUCTS ===================== */
function getFilteredProducts() {
  return PRODUCTS.filter(p => {
    if (state.categoryFilter === 'soldes' && !p.sale) return false;
    if (state.categoryFilter !== 'all' && state.categoryFilter !== 'soldes' && p.category !== state.categoryFilter) return false;
    if (state.ageFilter && p.age !== state.ageFilter) return false;
    if (state.universeFilter && p.universe !== state.universeFilter) return false;
    if (state.searchTerm && !p.name.toLowerCase().includes(state.searchTerm.toLowerCase())) return false;
    return true;
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyState');
  const list = getFilteredProducts();
  grid.innerHTML = '';
  empty.hidden = list.length !== 0;

  list.forEach(p => {
    const isFav = state.favorites.includes(p.id);
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-media" style="--product-bg:${p.bg}" data-open="${p.id}">
        ${p.sale ? '<span class="product-badge">Soldes</span>' : ''}
        <button class="product-fav ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="Ajouter aux favoris">${isFav ? '❤️' : '🤍'}</button>
        <span>${p.emoji}</span>
      </div>
      <div class="product-body">
        <span class="product-age">${p.ageLabel}</span>
        <h3 class="product-name" data-open="${p.id}">${p.name}</h3>
        <p class="product-price">${fmtPrice(p.price)}${p.oldPrice ? `<span class="old-price">${fmtPrice(p.oldPrice)}</span>` : ''}</p>
        <div class="color-swatches">
          ${p.colors.map((c, i) => `<span class="swatch ${i === 0 ? 'selected' : ''}" style="background:${c}" data-color="${c}" data-product="${p.id}"></span>`).join('')}
        </div>
        <button class="add-cart-btn" data-add="${p.id}">Ajouter au panier</button>
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

  document.getElementById('modalImage').textContent = p.emoji;
  document.getElementById('modalImage').style.background = p.bg;
  document.getElementById('modalAge').textContent = p.ageLabel;
  document.getElementById('modalProductName').textContent = p.name;
  document.getElementById('modalPrice').innerHTML = `${fmtPrice(p.price)}${p.oldPrice ? `<span class="old-price">${fmtPrice(p.oldPrice)}</span>` : ''}`;
  document.getElementById('modalQty').value = 1;

  const colorsWrap = document.getElementById('modalColors');
  colorsWrap.innerHTML = p.colors.map((c, i) => `<span class="swatch ${i === 0 ? 'selected' : ''}" style="width:28px;height:28px;background:${c}" data-modal-color="${c}"></span>`).join('');

  const favBtn = document.getElementById('modalFav');
  const isFav = state.favorites.includes(p.id);
  favBtn.textContent = isFav ? '❤️' : '🤍';
  favBtn.classList.toggle('active', isFav);

  document.getElementById('panelDescription').innerHTML = `
    <p>${p.description}</p>
    <h4 style="margin-top:16px;font-size:.95rem;">Détails écologiques</h4>
    <p>${p.ecoDetails}</p>
    <h4 style="margin-top:16px;font-size:.95rem;">Normes de sécurité</h4>
    <p>${p.safety}</p>
  `;
  document.getElementById('panelEntretien').innerHTML = `<p>${p.care}</p>`;
  const rows = p.sizeGuide;
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
    state.cart.push({ key, id: productId, color, qty, name: p.name, price: p.price, emoji: p.emoji, bg: p.bg });
  }
  saveState();
  renderCart();
  updateCounts();
  showToast(`${p.name} ajouté au panier 🛒`);
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

function renderCart() {
  const wrap = document.getElementById('cartItems');
  if (state.cart.length === 0) {
    wrap.innerHTML = '<p class="drawer-empty">Votre panier est vide pour le moment 🧺</p>';
  } else {
    wrap.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-media" style="background:${item.bg}">${item.emoji}</div>
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <p><span class="swatch" style="display:inline-block;width:12px;height:12px;background:${item.color};vertical-align:middle;margin-right:4px;"></span>${fmtPrice(item.price)}</p>
          <div class="cart-item-controls">
            <button data-qty-minus="${item.key}">−</button>
            <span>${item.qty}</span>
            <button data-qty-plus="${item.key}">+</button>
          </div>
          <button class="cart-item-remove" data-remove="${item.key}">Retirer</button>
        </div>
      </div>
    `).join('');
  }
  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = fmtPrice(total);
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
    wrap.innerHTML = '<p class="drawer-empty">Aucun favori pour l\'instant 💛<br>Cliquez sur le cœur d\'un produit !</p>';
    return;
  }
  wrap.innerHTML = favProducts.map(p => `
    <div class="cart-item">
      <div class="cart-item-media" style="background:${p.bg}">${p.emoji}</div>
      <div class="cart-item-info">
        <h5 style="cursor:pointer" data-open="${p.id}">${p.name}</h5>
        <p>${fmtPrice(p.price)}</p>
        <button class="cart-item-remove" data-unfav="${p.id}">Retirer des favoris</button>
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
  renderProducts();
  renderCart();
  renderFavorites();
  updateCounts();

  // Product grid delegation
  document.getElementById('productGrid').addEventListener('click', (e) => {
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

  // Filter chips
  document.getElementById('filterChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.categoryFilter = chip.dataset.filter;
    renderProducts();
  });

  // Nav links category filter
  document.querySelectorAll('[data-filter-category]').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.dataset.filterCategory;
      if (cat === 'marques') return;
      e.preventDefault();
      state.categoryFilter = cat;
      document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === cat));
      document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
      link.classList.add('active');
      renderProducts();
      document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
      closeMobileNav();
    });
  });

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
      document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Universe filter cards
  document.querySelectorAll('.category-card').forEach(card => {
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
      document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
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
      closeDrawer(document.getElementById('cartDrawer'), document.getElementById('cartOverlay'));
      closeDrawer(document.getElementById('favDrawer'), document.getElementById('favOverlay'));
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

  // Newsletter
  document.getElementById('newsletterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('newsletterMsg');
    msg.textContent = 'Merci pour votre inscription ! 🎉 Vérifiez votre boîte mail.';
    e.target.reset();
    setTimeout(() => { msg.textContent = ''; }, 5000);
  });

  // Sticky header shrink on scroll (subtle)
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none';
  });
});
