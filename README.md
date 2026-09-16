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
