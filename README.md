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

## Deploy dengan Podman

Project ini sudah disiapkan untuk bootstrap lokal memakai Podman dengan PostgreSQL terpisah.

### Prasyarat

- `podman`
- `npm`
- file `.env` lokal

### Setup Env

Project ini sekarang hanya memakai satu file env, yaitu `.env`, baik untuk menjalankan app secara biasa maupun lewat Podman.

Copy template env berikut:

```bash
cp .env.example .env
```

Field dasar yang dipakai app dan deploy Podman:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `APP_PORT`
- `DATABASE_URL`
- `DATABASE_SSL`
- `JWT_SECRET`
- `COOKIE_SECURE`

Field AI bersifat opsional. Jika `AI_PROVIDER` dikosongkan maka fitur auto-reply AI tidak aktif.

- `AI_PROVIDER`
- `AI_BASE_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_SYSTEM_EMAIL`
- `AI_SYSTEM_NAME`
- `AI_TEMPERATURE`
- `AI_MAX_TOKENS`
- `AI_TIMEOUT_MS`

### Cara Pakai Env

Gunakan satu file `.env`, lalu sesuaikan hanya nilai `DATABASE_URL` berdasarkan cara menjalankan aplikasi:

Untuk `npm run dev` atau app yang berjalan langsung di host:

```env
DATABASE_URL=postgresql://ticketing:ticketing123@localhost:5432/ticketing?sslmode=disable
DATABASE_SSL=false
COOKIE_SECURE=false
```

Untuk `bash scripts/deploy-podman.sh ...`, app berjalan di dalam container sehingga host database harus memakai nama container Postgres:

```env
DATABASE_URL=postgresql://ticketing:ticketing123@ticketing-postgres:5432/ticketing?sslmode=disable
DATABASE_SSL=false
COOKIE_SECURE=false
```

Praktiknya:

- Saat develop lokal tanpa container app, gunakan host `localhost`.
- Saat bootstrap atau menjalankan app lewat Podman, ubah host DB menjadi `ticketing-postgres`.
- Script deploy Podman otomatis membaca `.env` yang sama.
- Jika memang perlu file lain untuk eksperimen, script masih bisa diarahkan dengan `ENV_FILE=/path/to/file bash scripts/deploy-podman.sh bootstrap`.

### Konfigurasi AI

Bootstrap AI saat ini mendukung `openai-compatible` dan `ollama`.

Contoh OpenAI-compatible:

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-xxxx
AI_MODEL=gpt-4o-mini
AI_SYSTEM_EMAIL=ai-support@local
AI_SYSTEM_NAME=AI Support
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=400
AI_TIMEOUT_MS=30000
```

Contoh Ollama:

```env
AI_PROVIDER=ollama
AI_BASE_URL=http://host.containers.internal:11434
AI_API_KEY=
AI_MODEL=qwen2.5:7b
AI_SYSTEM_EMAIL=ai-support@local
AI_SYSTEM_NAME=AI Support
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=400
AI_TIMEOUT_MS=30000
```

Perilaku AI yang aktif saat ini:

- AI membuat reply awal setelah ticket dibuat.
- AI membalas setiap reply manusia baru pada timeline ticket.
- Tombol `Support Takeover` menghentikan balasan otomatis AI.
- Tombol `AI Takeover` mengaktifkan lagi AI dan langsung mencoba menjawab reply manusia terbaru yang belum dibalas.

### User Seed (Untuk Testing)

Setelah bootstrap dengan seed, Anda bisa login memakai user berikut:

| Role              | Nama          | Email                | Password   |
| ----------------- | ------------- | -------------------- | ---------- |
| Admin             | Admin         | admin@gmail.com      | admin123   |
| Project Coordinator | Dul         | dul@gmail.com        | test123    |
| Consultant        | Iqbal         | iqbal@gmail.com      | test123    |
| Consultant        | Trias         | trias@gmail.com      | test123    |
| Consultant        | Faaiq         | faaiq@gmail.com      | test123    |
| Consultant        | Mamat         | mamat@gmail.com      | test123    |
| Consultant        | Imboy         | imran@gmail.com      | test123    |
| Consultant        | William TP    | williamtp@gmail.com  | test123    |
| Consultant        | Chikam        | chikam@gmail.com     | test123    |

Catatan:

- Akun `AI Support` dibuat otomatis saat AI pertama kali berjalan (bukan akun login untuk end user).
- Password akun consultant dan project coordinator sama untuk keperluan testing lokal.

### Bootstrap

Jalankan satu command berikut dari folder `ticketing-dev/`:

```bash
bash scripts/deploy-podman.sh bootstrap
```

Command di atas akan:

- build image aplikasi,
- menjalankan container PostgreSQL,
- menerapkan schema database,
- menjalankan seed,
- menjalankan container aplikasi.

### Command lain

```bash
bash scripts/deploy-podman.sh status
bash scripts/deploy-podman.sh logs
bash scripts/deploy-podman.sh down
bash scripts/deploy-podman.sh down --volumes
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
