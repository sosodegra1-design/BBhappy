# Import produits Alibaba (a lancer sur TON PC)

Ce dossier ne fait rien tout seul sur le serveur BBVOLTEX. C'est un outil
que tu telecharges et lances toi-meme, une seule fois par lot de produits.

## Etapes

1. Installer Node.js (si pas deja fait) : https://nodejs.org (choisir la version LTS)
2. Ouvrir un terminal / invite de commandes dans ce dossier `alibaba-import`
3. Taper : `npm install axios cheerio`
4. Ouvrir `liens.txt` et coller un lien Alibaba par ligne
5. Taper : `node scraper.js`
6. Attendre la fin. Un dossier `resultats` apparait avec :
   - `products.json` (titre, description, liste des photos)
   - `images/` (toutes les photos telechargees)
7. Aller sur github.com, dans le repo `sosodegra1-design/BBhappy`,
   branche `claude/ecommerce-kids-toys-clothing-2anm9e`
8. Creer un nouveau dossier `import-produits` et glisser-deposer TOUT
   le contenu du dossier `resultats` dedans (bouton "Add file" -> "Upload files")
9. Valider (commit) directement sur cette branche
10. Me dire "c'est uploade" -> je recupere tout et je cree les fiches produits
    avec les vraies photos et les vraies descriptions.

## Si un site refuse le scraping

Certains produits Alibaba peuvent bloquer le script (protection anti-robot).
Dans ce cas le script l'indique dans le terminal et passe au suivant — pas de
souci, on traite ces cas-la a la main avec copier-coller des infos, comme
pour la table de chevet.
