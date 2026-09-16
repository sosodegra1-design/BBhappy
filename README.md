# BBVOLTEX

Site e-commerce pour jouets et vêtements enfants, avec un vrai backend
(Express + base de données SQLite/Turso) qui gère le panier, les favoris,
les points de fidélité et les commandes — les données survivent aux
redémarrages et aux redéploiements.

## Lancer le site en local

```bash
npm install
npm start
```

Le site est alors servi sur **http://localhost:3000** (front + API sur le
même port). Sans configuration, il utilise un fichier SQLite local
(`server/bbhappy.db`, ignoré par git) — zéro compte à créer pour développer.

## Ce que fait le backend (`server/`)

- `server/index.js` — serveur Express : sert les pages statiques (`index.html`,
  `css/`, `js/`, …) et expose l'API sous `/api/*`.
- `server/db.js` — connexion à la base de données via
  [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts),
  compatible SQLite. En local : fichier `server/bbhappy.db`. En production :
  une base [Turso](https://turso.tech) gratuite et persistante (voir plus bas).
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
| POST | `/api/checkout` | Passer la commande. Si Stripe est configuré : crée une session de paiement et renvoie `{redirectUrl}` vers la page de paiement Stripe. Sinon : crée directement la commande, vide le panier, crédite les points, et renvoie `{orderNumber, pointsEarned, total}`. |
| GET | `/api/checkout/confirm?session_id=...` | Appelé après un paiement Stripe réussi : vérifie la session auprès de Stripe, crée la commande (une seule fois même en cas de rechargement de page) et renvoie `{orderNumber, pointsEarned, total}` |

Sans le serveur lancé (ex: en ouvrant `index.html` directement dans le
navigateur), le site affiche un message d'erreur — il n'y a pas de repli
en stockage local, le panier vit uniquement côté serveur.

## Créer la base de données Turso (gratuite, persistante)

Nécessaire uniquement pour la production (le développement local fonctionne
sans, via le fichier SQLite local). Turso offre un plan gratuit qui suffit
largement à ce projet, et les données ne sont jamais perdues, même après un
redéploiement.

1. Va sur [turso.tech](https://turso.tech) et crée un compte gratuit
   (connexion possible avec GitHub).
2. Dans le tableau de bord, clique sur **Create Database**, donne-lui un nom
   (ex: `bbhappy`) et choisis la région la plus proche de toi.
3. Une fois la base créée, ouvre son onglet **Connect** (ou **Overview**) :
   - copie l'**URL** de connexion — elle ressemble à
     `libsql://bbhappy-tonpseudo.turso.io`
   - clique sur **Create Token** (ou **Generate Token**) et copie le jeton
     généré (il ne sera affiché qu'une fois)
4. Garde ces deux valeurs de côté, elles servent de variables d'environnement
   `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` à l'étape suivante.

## Configurer Stripe (paiement en ligne réel)

Nécessaire pour que le bouton « Payer » redirige vers une vraie page de
paiement. Sans cette configuration, la commande est simplement enregistrée
directement (mode démo, pas de paiement réel).

1. Va sur [stripe.com](https://stripe.com) et crée un compte gratuit.
2. Dans le tableau de bord, reste en **mode Test** (interrupteur en haut à
   droite) — cela permet de tester des paiements sans vraie carte bancaire.
3. Va dans **Développeurs** → **Clés API**, et copie la **clé secrète**
   (elle commence par `sk_test_...`).
4. Garde cette valeur de côté, elle sert de variable d'environnement
   `STRIPE_SECRET_KEY` :
   - en local : `STRIPE_SECRET_KEY="sk_test_..." npm start`
   - sur Render : à ajouter dans les variables d'environnement du service
     (voir étape suivante)
5. Pour tester un paiement, utilise le numéro de carte de test Stripe
   `4242 4242 4242 4242`, avec n'importe quelle date future, n'importe quel
   CVC et n'importe quel code postal.

**Pour accepter de vrais paiements (argent réel) :** il faut passer le
compte Stripe en mode Live (Stripe demande alors les informations de
l'entreprise et un compte bancaire), puis remplacer la clé `sk_test_...`
par la clé `sk_live_...` correspondante.

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
3. Render va te demander de renseigner les variables d'environnement —
   colle les valeurs récupérées sur Turso et Stripe aux étapes précédentes :
   - `TURSO_DATABASE_URL` → l'URL `libsql://...`
   - `TURSO_AUTH_TOKEN` → le jeton généré
   - `STRIPE_SECRET_KEY` → la clé secrète Stripe (`sk_test_...` ou
     `sk_live_...`). Optionnel : sans cette variable, le paiement fonctionne
     en mode démo (commande enregistrée directement, sans vraie page de
     paiement).
4. Clique sur **Apply** / **Create Web Service**. Le premier déploiement
   prend 1 à 2 minutes.
5. Une fois prêt, Render te donne une URL publique du type
   `https://bbhappy.onrender.com` — c'est ton site en ligne, avec une base
   de données qui persiste vraiment.

**Seule limite du plan gratuit Render à connaître :** le service s'endort
après ~15 minutes sans visite ; la requête suivante le réveille mais met
30 à 50 secondes à répondre le temps qu'il redémarre. Les données, elles,
ne bougent pas — elles sont sur Turso, pas sur Render.

### Tester Turso en local (optionnel)

Pour vérifier la connexion à ta base Turso avant de déployer :

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm start
```

Le message affiché au démarrage confirme quelle base est utilisée
(`Database: Turso (...)` ou `Database: local SQLite file`).
