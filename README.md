# 🚀 Next.js Project Documentation

Aplikasi ini dibangun menggunakan **Next.js** dengan dukungan **Node.js versi >= 20**.  
Dokumentasi ini memberikan gambaran umum tentang cara memulai, struktur project, serta beberapa detail kasus yang sering ditemui.

---

## 📑 Table of Content

1. [Get Started](#-get-started)
2. [Project Structure](#-project-structure)

---

## 🛠 Get Started

### Prerequisite

- **Node.js** `>= 20`
- **npm** atau **yarn** package manager

### Installation

Clone repository ini, lalu install dependencies:

```bash
git clone -b dev https://github.com/Ticketing-MS/ticketing-ms.git
cd ticketing-ms

# development
npm install
# atau
yarn install

# production
npm run build
npm run start
```

## Project Structure

```yaml
project-name/
├── app/                            # Next.js App Router (routing, pages, layouts)
│   ├── (after-login)/              # UI group after login
│   │   ├── dashboard/
│   │   │   ├── (admin)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── _validation.ts  # Define schema validation
│   │   │   │   └── _components/    # Spesific component for this page
│   │   │   └── (consultant)/
│   │   ├── layout.tsx              # Layout for dashboard after login
│   │   └── ...                     # Another ui after login
│   ├── api/                        # API routes
│   │   ├── auth/                   # API auth
│   │   │   ├── login/              # API login
│   │   │   │   ├── route.ts        # Define handler and needed middleware for this api
│   │   │   │   ├── service.ts      # Define bussines logic
│   │   │   │   ├── validation.ts   # Define schema validation
│   │   │   │   └── dto.ts          # Define some interface/type needed for this api
│   │   │   └── ...                 # Another API auth
│   │   └── ...                     # Another API route
│   ├── blocked/                    # Unauthorized UI
│   ├── login/                      # Login UI
│   ├── profile/                    # Profile UI
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Entry point halaman utama
│   ├── favicon.ico
│   └── globals.css
│
├── components/                     # Global UI Component
├── config/                         # Konfigurasi (database, logger, dll)
├── drizzle/                        # Output schema database from drizzle
├── hooks/                          # Output schema database from drizzle
│   ├── context/
│   │   ├── ThemeContext.tsx        # Context to change app theme
│   │   └── UserLogInContext.tsx    # Context to save data loged in user
│   └── custom/                     # For custom hooks
│
├── lib/                            # Utility functions / helper
│   ├── db/                         # Database utility
│   │   ├── models/                 # Interface of data from database (model)
│   │   ├── schemas/                # Schema database
│   │   └── seeders/                # Dummy data
│   ├── errors/
│   │   ├── api/                    # Custom error for api
│   │   └── web/                    # Custom error for web app
│   ├── middlewares/
│   │   ├── api/                    # Custom middleware for api
│   │   └── web/                    # Custom middleware for web app
│   └── utils/                      # Define some utility function
│
├── public/                         # Static assets (images, icons, dll)
├── scripts/                        # Custom scripts
├── styles/                         # File CSS / Tailwind configuration
├── .editorconfig                   # Editor tools configuration
├── .env                            # Environment variables
├── .env.example                    # Template environment variables
├── middleware.ts                   # Middleware Next.js (center)
├── package.json
├── next.config.js                  # Konfigurasi next.js
├── tailwind.config.js              # Konfigurasi tailwind css
├── tsconfig.json                   # Konfigurasi typescript
└── README.md                       # Dokumentasi

```

### Before Push

1. Check linter

```
npm run lint
# or
yarn run lint
```

2. Push to github

```
git add .
git commit -m "<message>"
git push
```
