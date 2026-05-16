# Mr Impot - Backend API

API REST pour la plateforme de consultation juridique Mr Impot.

## 🚀 Déploiement

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📦 Stack

- **Framework** : Next.js 16 (App Router)
- **Base de données** : Supabase (PostgreSQL)
- **Stockage** : Supabase Storage
- **Validation** : Zod
- **Authentification** : Supabase Auth (email/password + Google OAuth)

## 🔧 Installation

```bash
git clone https://github.com/kiluazoldick/mr-impot-backend.git
cd mr-impot-backend
npm install
cp .env.example .env.local
# Remplir les variables d'environnement
npm run dev
```

## 🌍 Variables d'environnement

| Variable                        | Description                  |
| ------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé secrète Supabase (admin) |
| `APP_URL`                       | URL de l'application         |

## 📖 Documentation API

Lance le serveur et va sur `/api/docs` pour voir la documentation complète.

## 📁 Structure

```
src/
├── app/api/
│   ├── admin/        # Routes admin (protégées)
│   │   ├── categories/
│   │   ├── documents/
│   │   ├── videos/
│   │   └── users/
│   ├── auth/         # Authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── me/
│   └── public/       # API publique
│       ├── categories/
│       ├── documents/
│       ├── videos/
│       └── search/
├── lib/
│   ├── services/     # Logique métier
│   ├── supabase/     # Client Supabase
│   └── validations/  # Schémas Zod
└── proxy.ts          # Middleware CORS + Auth
```

## 🔐 Authentification

- `POST /api/auth/login` - Connexion email/mot de passe
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Profil connecté

Les routes `/api/admin/*` nécessitent un cookie `sb-access-token`.

## 📄 API Publique

Accessible sans authentification :

- `GET /api/public/categories`
- `GET /api/public/documents?page=1&limit=20&search=terme`
- `GET /api/public/documents/{id}`
- `GET /api/public/documents/{id}?download=true`
- `GET /api/public/videos`
- `GET /api/public/videos/{id}`
- `GET /api/public/search?q=terme&mode=fulltext`

## 🛠️ Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Démarrer production
npm run lint     # Linter
```

## 📝 Licence

Propriétaire - Mr Impot
