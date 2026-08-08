# 🚀 Next.js Project Documentation

Aplikasi ini dibangun menggunakan **Next.js** dengan dukungan **Node.js versi >= 20**.  
Dokumentasi ini memberikan gambaran umum tentang cara memulai, struktur project, serta beberapa detail kasus yang sering ditemui.

---

## 📑 Table of Content

1. [Get Started](#-get-started)
2. [Cara Deploy di Local (Tanpa Docker)](#-cara-deploy-di-local-tanpa-docker-development)
3. [Cara Deploy Menggunakan scripts/deploy.sh (Docker / Podman)](#-cara-deploy-menggunakan-scriptsdeploysh-docker--podman)
4. [Project Structure](#-project-structure)

---

## 🛠 Get Started

### Prerequisite

- **Node.js** `>= 20` (disarankan LTS terbaru)
- **npm** atau **yarn** package manager
- PostgreSQL versi 16 (jika menjalankan di lokal tanpa Docker)
- Docker **atau** Podman (opsional, untuk deployment dengan script `deploy.sh`)

### Installation

Clone repository ini, lalu install dependencies:

```bash
git clone -b dev https://github.com/Ticketing-MS/ticketing-ms.git
cd ticketing-ms/ticketing-dev

npm install
```

---

## 💻 Cara Deploy di Local (Tanpa Docker — Development)

Cocok jika kamu ingin debugging, hot code reload, atau develop fitur baru secara interaktif tanpa build container.

### Step 1: Setup PostgreSQL Lokal

Pastikan PostgreSQL 16 sudah terinstall dan berjalan di `localhost:5432`. Buat database dan user baru:

```sql
-- Jalankan di psql postgres
CREATE USER ticketing WITH PASSWORD 'ticketing123';
CREATE DATABASE ticketing OWNER ticketing;
GRANT ALL PRIVILEGES ON DATABASE ticketing TO ticketing;
```

> ⚠️ **Atau**: Kalau kamu punya Docker/Podman tapi mau app jalan host-only, cukup jalankan Postgres container saja tanpa deploy app lengkap:
> ```bash
> docker run -d --name ticketing-postgres \
>   -p 5432:5432 \
>   -e POSTGRES_DB=ticketing \
>   -e POSTGRES_USER=ticketing \
>   -e POSTGRES_PASSWORD=ticketing123 \
>   -v ticketing-postgres-data:/var/lib/postgresql/data \
>   postgres:16-alpine
> ```

### Step 2: Copy dan Konfigurasi `.env`

```bash
cp .env.example .env
```

Pastikan field berikut **untuk mode host** (bukan container):

```env
# --- Database (host mode) ---
POSTGRES_DB=ticketing
POSTGRES_USER=ticketing
POSTGRES_PASSWORD=ticketing123
POSTGRES_PORT=5432
# host = localhost karena app berjalan langsung di host, TIDAK di dalam container
DATABASE_URL=postgresql://ticketing:ticketing123@localhost:5432/ticketing?sslmode=disable
DATABASE_SSL=false

# --- App ---
APP_PORT=3000
JWT_SECRET=isi_random_string_panjang_minimal_32_charakter_disini
COOKIE_SECURE=false
```

> 💡 **Opsional (AI)**: Isi field `AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` jika ingin mengaktifkan fitur AI auto-reply. Kosongkan saja jika tidak dibutuhkan (AI tidak aktif, app tetap jalan normal).

### Step 3: Terapkan Schema Database (Drizzle)

```bash
# Terapkan semua SQL schema ke database lokal
npm run db:push
# ATAU jika ingin memakai file SQL migrasi manual:
# psql -U ticketing -d ticketing -h localhost < drizzle/0000_mature_skullbuster.sql
```

### Step 4: Jalankan Seed Database

Seed akan mengisi user testing, project, phase, ticket dummy:

```bash
npm run db:seed
```

Keluaran sukses kurang lebih: `Seeded 9 files.`

### Step 5: Jalankan Aplikasi Mode Development (Hot Reload)

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000). Login dengan user seed yang tertera di bagian bawah dokumen ini.

### Step 6 (Opsional): Build untuk Production + Start

```bash
# Type check & build bundle
npm run build
# Jalankan bundle hasil build
npm run start
```

### Step 7 (Opsional): Debug Konfigurasi AI via Healthz

```bash
curl -sS http://localhost:3000/api/healthz | jq .ai
```

Cek field `configured: true` dan `issues: []` untuk memastikan AI config valid.

---

## 🐳 Cara Deploy Menggunakan scripts/deploy.sh (Docker / Podman)

Cocok untuk staging lokal, QA, atau production single-node — semua stack (App Next.js + PostgreSQL 16) dijalankan sebagai container terpisah.

Project ini sudah disiapkan untuk bootstrap lokal memakai Docker atau Podman. Satu file script utilitas utama: [`deploy.sh`](scripts/deploy.sh).

### Prasyarat

- `docker` **atau** `podman` terinstall di host
- `npm` (hanya untuk install dev dependency lint jika ingin; build container otomatis handle install dependency di dalam Dockerfile)
- File `.env` lokal (satu file env untuk app container dan debug lokal)

### Memilih Container Runtime

Script `scripts/deploy.sh` mendukung 2 engine, urutan prioritas:

| Metode Override | Contoh |
| --- | --- |
| Otomatis (auto detect) | `bash scripts/deploy.sh bootstrap` → pakai `docker` jika ada, fallback `podman` |
| Environment variable | `CONTAINER_RUNTIME=podman bash scripts/deploy.sh bootstrap` |
| Flag inline (paling tinggi prioritas) | `bash scripts/deploy.sh --runtime=docker bootstrap` |

---

### Step 1: Copy dan Siapkan `.env`

```bash
cd ticketing-dev/
cp .env.example .env
```

⚠️ **PENTING untuk mode Container**: `DATABASE_URL` harus menggunakan **nama container Postgres** sebagai hostname, BUKAN `localhost` (karena `localhost` di dalam app container menunjuk ke dirinya sendiri, bukan ke host):

```env
# --- Database (container mode) ---
POSTGRES_DB=ticketing
POSTGRES_USER=ticketing
POSTGRES_PASSWORD=ticketing123
POSTGRES_PORT=5432

# ⭐ Hostname = ticketing-postgres (nama container DB)
DATABASE_URL=postgresql://ticketing:ticketing123@ticketing-postgres:5432/ticketing?sslmode=disable
DATABASE_SSL=false

# --- App ---
APP_PORT=3000
JWT_SECRET=isi_random_string_panjang_minimal_32_charakter_disini
COOKIE_SECURE=false
```

> 🔁 Perbandingan Cepat `DATABASE_URL`:
> | Mode | Host | Contoh URL |
> | --- | --- | --- |
> | `npm run dev` (host) | `localhost` | `postgresql://...@localhost:5432/ticketing?sslmode=disable` |
> | `bash scripts/deploy.sh ...` (container) | `ticketing-postgres` | `postgresql://...@ticketing-postgres:5432/ticketing?sslmode=disable` |

---

### Step 2: Bootstrap Satu Command Full Stack

Untuk pertama kali setup (build image, start DB, apply schema, seed, start app):

```bash
bash scripts/deploy.sh bootstrap
```

Script `bootstrap` akan menjalankan urutan berikut secara otomatis:

1. 🧠 Resolve container runtime (docker/podman)
2. 📄 Load `.env` dan validasi field required (POSTGRES_DB, JWT_SECRET, dll)
3. 🌐 Buat Docker/Podman network `ticketing-net` (jika belum ada)
4. 💾 Buat volume `ticketing-postgres-data` untuk persistensi data DB
5. 🏗 **Hapus image app lama** (jika ada) + **rebuild** image `localhost/ticketing-app:local` secara fresh (hindari stale env cache)
6. 🐘 Jalankan container PostgreSQL `ticketing-postgres` (port mapping host: `POSTGRES_PORT:5432`)
7. ⏳ Tunggu Postgres `pg_isready` (maks 60 detik)
8. 📂 Apply schema drizzle SQL ke DB
9. 🌱 Jalankan `npm run db:seed` di dalam container sementara
10. 🚀 Jalankan container app `ticketing-app` (port mapping host: `APP_PORT:3000`)
11. ✅ Print status container dan URL akses

Setelah keluaran `ticketing Status container` tampil dan kedua container `STATUS = Up`, buka:

👉 [http://localhost:3000](http://localhost:3000)

> 💡 Tunggu 15-30 detik untuk Next.js production server melakukan startup awal (pada permintaan pertama page bisa loading sebentar). Untuk memastikan app siap:
> ```bash
> curl -I -sS http://localhost:3000/api/healthz
> # → HTTP 200 = ready
> ```

---

### Step 3: Perintah Umum Lainnya (Deploy Control)

Setelah bootstrap, kamu bisa memakai command berikut untuk operasi harian:

| Command | Deskripsi |
| --- | --- |
| `bash scripts/deploy.sh status` | Lihat status container app + postgres + URL akses |
| `bash scripts/deploy.sh logs` | Tail `-f` log container aplikasi (Next.js stdout/stderr) |
| `bash scripts/deploy.sh seed` | Jalankan ulang seed database (berguna jika data perlu direset, tanpa build/start ulang app) |
| `bash scripts/deploy.sh up` | **Build image ulang** + jalankan ulang container **app SAJA**. Postgres tetap jalan jika sudah ada. Cocok setelah kamu edit kode app dan ingin deploy ulang tanpa reset DB. |
| `bash scripts/deploy.sh down` | Stop & hapus container app + postgres. **Volume DB TETAP** (data ticket tersimpan). |
| `bash scripts/deploy.sh down --volumes` | Stop & hapus container **SEKALIGUS HAPUS VOLUME DB** (data ticket hilang total, fresh state untuk testing). |

#### Contoh Alur Kerja Setelah Ada Perubahan Kode:

```bash
# 1. Edit kode di ticketing-dev/app/... atau ticketing-dev/lib/...

# 2. Build ulang image app + restart app container (DB TETAP JALAN, data tidak hilang)
bash scripts/deploy.sh up

# 3. Cek status dan logs
bash scripts/deploy.sh status
bash scripts/deploy.sh logs
```

#### Contoh Reset Full State Fresh (Untuk Smoke Test):

```bash
# Stop container, HAPUS SEMUA DATA DB
bash scripts/deploy.sh down --volumes

# Bootstrap fresh dari nol (rebuild image, apply schema, seed)
bash scripts/deploy.sh bootstrap
```

---

### Step 4: Verifikasi Deployment (Health Check + Smoke Test)

#### 4.1 Healthz Endpoint (Debug AI & App)

```bash
curl -sS http://localhost:3000/api/healthz | jq
```

Keluaran expected:
```json
{
  "ok": true,
  "timestamp": "...",
  "ai": {
    "configured": true,
    "provider": "openai-compatible",
    "model": "nama-model-kamu",
    "baseUrlMasked": "https://...",
    "hasApiKey": true,
    "issues": []
  }
}
```

- `ai.configured = false` + `ai.issues` terisi → cek konfigurasi AI di `.env` lalu `down` + `bootstrap` ulang.
- `ok = true` → app dan koneksi DB sehat.

#### 4.2 Login Test dengan Credential Seed

Buka [http://localhost:3000/login](http://localhost:3000/login) dan login dengan salah satu user di tabel seed bawah.

#### 4.3 Smoke Test Response Time Create Ticket (Non-Blocking AI)

```bash
# 1. Login & simpan cookie
curl -sS -c /tmp/cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"dul@gmail.com","password":"test123"}' \
  http://localhost:3000/api/auth/login >/dev/null

# 2. Dapatkan PROJECT_ID dari /api/projects/my, lalu:
time curl -sS -b /tmp/cookies.txt \
  -X POST -H "Content-Type: application/json" \
  -d '{"projectId":"<PROJECT_ID>","title":"Smoke Test","description":"test non-blocking","phaseId":"<PHASE_ID>","dueDate":"2026-09-12"}' \
  -w "\nHTTP:%{http_code} TOTAL:%{time_total}s\n" \
  http://localhost:3000/api/tickets >/dev/null
```

Expected: `TOTAL ≤ 1.5 seconds` (create ticket sudah non-blocking; AI generate di background, user tidak menunggu reply AI).

---

### Troubleshooting Deployment Script

#### ❌ Port Conflict: `Bind for 0.0.0.0:3000 failed: port is already allocated`
```bash
# Cek proses yang memakai port
lsof -i :3000; lsof -i :5432
# Matikan proses bentrok ATAU ganti APP_PORT / POSTGRES_PORT di .env lalu bootstrap ulang dengan down
```

#### ❌ Error: `DATABASE_URL` connection refused / `ticketing-postgres` resolv gagal
- Pastikan kamu **tidak memakai `localhost`** di `DATABASE_URL` untuk mode container. Ganti hostname menjadi `ticketing-postgres`.
- Pastikan network `ticketing-net` dibuat: `docker network ls | grep ticketing-net`.
- Jalankan `bash scripts/deploy.sh down` diikuti `bootstrap` untuk re-init network & container.

#### ❌ Stale Env / Env Tidak Terbaca (baru ganti .env tapi masih pakai env lama)
Ini terjadi karena Docker layer image cache env pada waktu **build image lama**. Script deploy `bootstrap` dan `up` **SUDAH OTOMATIS menghapus image lama sebelum rebuild** (`rmi -f localhost/ticketing-app:local`). Jika masih ragu:
```bash
bash scripts/deploy.sh down
docker rmi -f localhost/ticketing-app:local 2>/dev/null
podman rmi -f localhost/ticketing-app:local 2>/dev/null
bash scripts/deploy.sh bootstrap
```

#### ❌ Container App Exit / Restart Loop
```bash
# Lihat 100 baris log terakhir app container (bukan logs -f, langsung temukan error startup)
docker logs --tail 100 ticketing-app 2>&1 | head -120
# Podman:
podman logs --tail 100 ticketing-app 2>&1 | head -120
```
Penyebab umum: JWT_SECRET kosong / kurang dari 32 karakter, atau field required lain di `.env` tidak diisi.

#### ❌ AI Warning: `AI runtime config is incomplete` di container logs
Lihat panduan **Troubleshooting Warning AI** di bagian Konfigurasi AI bawah. Periksa `AI_PROVIDER` pakai salah satu alias yang didukung, pastikan `AI_BASE_URL` reachable dari dalam container (Ollama host → `host.docker.internal` / `host.containers.internal`).

---

### Referensi Lengkap Command deploy.sh

```
Usage: bash scripts/deploy.sh [--runtime=docker|podman] <command> [options]

Commands:
  bootstrap   Build image, start Postgres, apply schema, seed, lalu run app
              (Full cycle, untuk setup pertama kali atau reset state full)
  up          Build image ulang + jalankan container app; Postgres tidak di-restart jika sudah running
              (Untuk deploy ulang kode app tanpa reset database)
  down        Stop dan hapus container app + postgres
              Volume database TETAP tersimpan (data ticket tidak hilang)
  logs        Tampilkan log aplikasi secara streaming (-f)
  seed        Jalankan ulang seed database (container app/postgres harus running)
  status      Tampilkan status container app + postgres dan URL akses

Options:
  --runtime=docker|podman   Override pemilihan container runtime
  --volumes                 HANYA untuk command `down`: hapus JUGA volume database (reset total)

Environment Override:
  CONTAINER_RUNTIME         Override runtime: docker atau podman
  ENV_FILE                  Path ke file env (default: ./ticketing-dev/.env)
  NETWORK_NAME              Override nama network (default: ticketing-net)
  DB_VOLUME_NAME            Override nama volume DB (default: ticketing-postgres-data)
  DB_CONTAINER_NAME         Override nama container DB (default: ticketing-postgres)
  APP_CONTAINER_NAME        Override nama container app (default: ticketing-app)
  APP_IMAGE_NAME            Override nama image (default: ticketing-app:local)
```

Contoh override environment:
```bash
# Jalankan bootstrap dengan podman + file env khusus
ENV_FILE=/home/user/env/my-ticketing.env CONTAINER_RUNTIME=podman bash scripts/deploy.sh bootstrap

# Stop semua container dan hapus volume total
bash scripts/deploy.sh down --volumes
```

---

## Deploy dengan Docker / Podman

Project ini sudah disiapkan untuk bootstrap lokal memakai Docker atau Podman dengan PostgreSQL terpisah. Script default: `scripts/deploy.sh`.

### Prasyarat (Rangkuman)

- `docker ATAU podman`
- `npm`
- file `.env` lokal

### Setup Env

Project ini sekarang hanya memakai satu file env, yaitu `.env`, baik untuk menjalankan app secara biasa maupun lewat Docker / Podman.

Copy template env berikut:

```bash
cp .env.example .env
```

Field dasar yang dipakai app dan deploy Docker/Podman:

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

Untuk `bash scripts/deploy.sh ...`, app berjalan di dalam container sehingga host database harus memakai nama container Postgres:

```env
DATABASE_URL=postgresql://ticketing:ticketing123@ticketing-postgres:5432/ticketing?sslmode=disable
DATABASE_SSL=false
COOKIE_SECURE=false
```

Praktiknya:

- Saat develop lokal tanpa container app, gunakan host `localhost`.
- Saat bootstrap atau menjalankan app lewat Docker/Podman, ubah host DB menjadi `ticketing-postgres`.
- Script deploy Docker/Podman otomatis membaca `.env` yang sama.
- Jika memang perlu file lain untuk eksperimen, script masih bisa diarahkan dengan `ENV_FILE=/path/to/file bash scripts/deploy.sh bootstrap`.

### Memilih Container Runtime
Script `scripts/deploy.sh` mendukung dua container engine dengan urutan prioritas:
- Auto-detect: jika `docker` tersedia di host, pakai Docker; jika tidak coba `podman`.
- Override via env: `CONTAINER_RUNTIME=docker` atau `CONTAINER_RUNTIME=podman`.
- Override via flag: `bash scripts/deploy.sh --runtime=docker <command>` atau `--runtime=podman`.

Flag `--runtime=...` jika diset, lebih tinggi prioritasnya dibanding env `CONTAINER_RUNTIME`.

Catatan khusus untuk konfigurasi AI Ollama yang memakai host (bukan container):
- Untuk Docker: set `AI_BASE_URL=http://host.docker.internal:11434`
- Untuk Podman: set `AI_BASE_URL=http://host.containers.internal:11434`

### Konfigurasi AI

Bootstrap AI saat ini mendukung `openai-compatible` dan `ollama`.

**Alias Provider yang Didukung** (nilai `AI_PROVIDER` tidak case-sensitive):
- `openai-compatible` bisa diisi: `openai-compatible`, `openai`, `open-ai`, `openai-compat`, `openai_api`
- `ollama` bisa diisi: `ollama`, `local-ollama`

**Pola Base URL**:
- Endpoint OpenAI-compatible (OpenAI resmi, self-host v1 style): base URL biasanya diakhiri `/v1` (contoh: `https://api.openai.com/v1`)
- Endpoint Ollama: **TANPA** `/v1` (contoh host: `http://localhost:11434`) → dari dalam container gunakan
  - Docker: `http://host.docker.internal:11434`
  - Podman: `http://host.containers.internal:11434`

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

**Troubleshooting Warning AI**

Jika log aplikasi menampilkan pesan `AI runtime config is incomplete. Issues: ...`, berarti ada field AI yang kosong atau invalid. Berikut hal yang perlu dicek:

1. **Field minimal yang wajib diisi** (tidak boleh kosong):
   - `AI_PROVIDER` (harus salah satu alias di atas)
   - `AI_BASE_URL` (harus diawali `http://` atau `https://`)
   - `AI_MODEL` (nama model, contoh: `llama3.1`, `qwen2.5:7b`, `gpt-4o-mini`, atau model custom endpoint)
2. **Jika nilai provider invalid** (tidak match alias), log akan menuliskan value saat ini yang invalid.
3. **Jika endpoint AI tidak bisa diakses dari dalam container** (misal Ollama lokal di host), pastikan memakai hostname internal container seperti `host.docker.internal` atau `host.containers.internal` di atas, atau pastikan network firewall membolehkan outbound ke IP/port endpoint AI.
4. **Setelah mengubah `.env`**, untuk menerapkan env baru dengan aman: jalankan `bash scripts/deploy.sh down` (atau `down --volumes` jika perlu reset DB) diikuti `bash scripts/deploy.sh bootstrap` agar image app dan container dibuat fresh kembali (image app akan dihapus dan dibuild ulang otomatis setiap bootstrap).

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
bash scripts/deploy.sh bootstrap
```

Command di atas akan:

- build image aplikasi,
- menjalankan container PostgreSQL,
- menerapkan schema database,
- menjalankan seed,
- menjalankan container aplikasi.

### Command lain

```bash
bash scripts/deploy.sh status
bash scripts/deploy.sh logs
bash scripts/deploy.sh down
bash scripts/deploy.sh down --volumes
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
