# Démarcheur — Plateforme Immobilière Guinée

## Lancer le projet en local

### 1. Backend
```bash
cd server
npm install
cp .env.example .env   # Remplir les variables
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env.local
npm start
```

### Variables d'environnement à configurer

**server/.env**
- `MONGO_URI` — votre URI MongoDB Atlas (gratuit)
- `JWT_SECRET` — chaîne aléatoire longue
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — depuis cloudinary.com

**client/.env.local**
- `REACT_APP_API_URL` — URL de votre API (ex: https://demarcheur-api.onrender.com/api)

### Créer le premier compte admin
1. Inscrivez-vous normalement sur le site
2. Dans MongoDB Atlas, trouvez votre utilisateur et changez `role` de `proprietaire` à `admin`

## Déploiement gratuit

- **Backend** → [Render.com](https://render.com) (Web Service, Node)
- **Frontend** → [Vercel.com](https://vercel.com) (React)
- **Base de données** → [MongoDB Atlas](https://cloud.mongodb.com) (Free Tier M0)
- **Photos** → [Cloudinary](https://cloudinary.com) (Free Tier)
