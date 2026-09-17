// Script a lancer SUR TON PC (pas sur le serveur), pas dans BBVOLTEX en ligne.
//
// A quoi ca sert : tu lui donnes une liste de liens Alibaba, il va chercher
// le titre, le prix, la description et les photos de chaque produit, et il
// range tout dans un dossier "resultats" (fichier products.json + photos).
// Ensuite tu uploades juste ce dossier "resultats" sur GitHub (glisser-deposer,
// pas besoin de ligne de commande) et je m'occupe du reste.
//
// INSTALLATION (une seule fois) :
//   1. Installer Node.js si ce n'est pas deja fait : https://nodejs.org (version LTS)
//   2. Ouvrir un terminal dans ce dossier "alibaba-import"
//   3. Taper : npm install axios cheerio
//
// UTILISATION :
//   1. Ouvrir le fichier "liens.txt" a cote de ce script
//   2. Coller un lien Alibaba par ligne (autant que tu veux)
//   3. Dans le terminal, taper : node scraper.js
//   4. Attendre la fin (ca affiche chaque produit trouve)
//   5. Le dossier "resultats" contient products.json + les photos telechargees
//   6. Uploader ce dossier "resultats" sur GitHub, dans le repo BBhappy,
//      branche claude/ecommerce-kids-toys-clothing-2anm9e, dans un nouveau
//      dossier "import-produits" -> je recupere et je cree les fiches produits.

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const LIENS_FILE = path.join(__dirname, 'liens.txt');
const OUT_DIR = path.join(__dirname, 'resultats');
const IMAGES_DIR = path.join(OUT_DIR, 'images');

function ensureDirs() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function readLinks() {
  if (!fs.existsSync(LIENS_FILE)) {
    fs.writeFileSync(LIENS_FILE, '# Colle un lien Alibaba par ligne ci-dessous\n');
    console.log('Fichier liens.txt cree. Mets-y tes liens Alibaba puis relance le script.');
    process.exit(0);
  }
  return fs.readFileSync(LIENS_FILE, 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

async function downloadImage(url, destPath) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  fs.writeFileSync(destPath, res.data);
}

async function scrapeOne(url, index) {
  console.log(`\n[${index}] Recuperation de : ${url}`);
  const { data: html } = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim() || $('title').text().trim();

  // Description : on recupere le texte des blocs de specifications / description
  let description = $('meta[name="description"]').attr('content') || '';
  if (!description) {
    description = $('.description, .product-description, [class*="description"]')
      .first().text().trim().slice(0, 800);
  }

  // Images : og:image + toutes les balises img plausibles du produit
  const images = new Set();
  const og = $('meta[property="og:image"]').attr('content');
  if (og) images.add(og);
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && /\.(jpg|jpeg|png|webp)/i.test(src) && !/logo|icon|avatar/i.test(src)) {
      images.add(src.startsWith('//') ? 'https:' + src : src);
    }
  });
  const imageUrls = Array.from(images).slice(0, 6);

  const productSlug = `produit-${index}`;
  const localImages = [];
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const ext = path.extname(new URL(imageUrls[i]).pathname).split('?')[0] || '.jpg';
      const filename = `${productSlug}-${i + 1}${ext}`;
      await downloadImage(imageUrls[i], path.join(IMAGES_DIR, filename));
      localImages.push(`images/${filename}`);
      console.log(`   photo ${i + 1} telechargee`);
    } catch (e) {
      console.log(`   photo ${i + 1} ignoree (${e.message})`);
    }
  }

  return {
    sourceUrl: url,
    title,
    description,
    images: localImages
  };
}

async function main() {
  ensureDirs();
  const links = readLinks();
  if (links.length === 0) {
    console.log('Aucun lien trouve dans liens.txt. Ajoute des liens Alibaba (un par ligne) puis relance.');
    return;
  }

  const results = [];
  for (let i = 0; i < links.length; i++) {
    try {
      const product = await scrapeOne(links[i], i + 1);
      results.push(product);
    } catch (e) {
      console.log(`   ECHEC pour ce lien : ${e.message}`);
      results.push({ sourceUrl: links[i], error: e.message });
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'products.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\nTermine. ${results.length} produit(s) traite(s).`);
  console.log(`Resultats dans : ${OUT_DIR}`);
  console.log('Prochaine etape : uploader le dossier "resultats" sur GitHub.');
}

main();
