# BBHappY

Site e-commerce pour jouets et vêtements enfants, avec un petit backend
(Express + SQLite) qui gère le panier, les favoris, les points de fidélité
et les commandes.

## Lancer le site

```bash
npm install
npm start
```

Le site est alors servi sur **http://localhost:3000** (front + API sur le
même port, donc pas de configuration CORS à faire).

## Ce que fait le backend (`server/`)

- `server/index.js` — serveur Express : sert les pages statiques (`index.html`,
  `css/`, `js/`, …) et expose l'API sous `/api/*`.
- `server/db.js` — base SQLite locale (`server/bbhappy.sqlite`, créée
  automatiquement au premier lancement, ignorée par git).
- `server/products-data.js` — catalogue produit, seule source de vérité,
  servi au navigateur via `GET /api/products`.

Chaque visiteur est identifié par un cookie généré au premier chargement
(pas de compte) : c'est cette valeur qui sert de clé pour son panier, ses
favoris et ses points de fidélité côté serveur.

### Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/products` | Catalogue complet |
| GET | `/api/cart` | Panier du visiteur courant |
| POST | `/api/cart/items` | Ajouter un article `{productId, color, qty}` |
| PATCH | `/api/cart/items/:id` | Changer la quantité `{qty}` |
| DELETE | `/api/cart/items/:id` | Retirer un article |
| GET | `/api/favorites` | Favoris du visiteur |
| POST/DELETE | `/api/favorites/:productId` | Ajouter/retirer un favori |
| GET | `/api/loyalty` | Points de fidélité + paliers |
| POST | `/api/loyalty/bonus` | Ajouter un bonus `{amount}` |
| POST | `/api/checkout` | Passer la commande, vide le panier, crédite les points |

Sans le serveur lancé (ex: en ouvrant `index.html` directement dans le
navigateur), le site affiche un message d'erreur — il n'y a plus de
repli en stockage local, le panier vit uniquement côté serveur.

## Déployer sur Render (gratuit)

Le dépôt contient déjà tout ce qu'il faut (`render.yaml`, `.node-version`,
`npm start` qui écoute sur `process.env.PORT`) pour un déploiement en
quelques clics :

1. Va sur [render.com](https://render.com) et connecte-toi (le plus simple
   est de te connecter directement avec ton compte GitHub).
2. Clique sur **New +** → **Blueprint**, puis sélectionne le dépôt
   `sosodegra1-design/bbhappy` et la branche
   `claude/ecommerce-kids-toys-clothing-2anm9e`.
   Render détecte automatiquement `render.yaml` et pré-remplit tout
   (build `npm install`, start `npm start`, plan gratuit).
   *(Si l'option Blueprint n'apparaît pas : New + → Web Service → même
   dépôt/branche → Build Command `npm install` → Start Command `npm start`
   → plan Free.)*
3. Clique sur **Apply** / **Create Web Service**. Le premier déploiement
   prend 1 à 2 minutes.
4. Une fois prêt, Render te donne une URL publique du type
   `https://bbhappy.onrender.com` — c'est ton site en ligne.

**Deux limites du plan gratuit à connaître :**
- Le service s'endort après ~15 minutes sans visite ; la requête suivante
  le réveille mais met 30-50 secondes à répondre le temps qu'il redémarre.
- Le fichier SQLite (`server/bbhappy.sqlite`) vit sur un disque éphémère :
  il est réinitialisé à chaque redéploiement (nouveau commit poussé). Pour
  une vraie boutique en production, il faudrait un disque persistant Render
  (plan payant) ou une base de données managée externe — largement
  suffisant en l'état pour une démo/portfolio.
