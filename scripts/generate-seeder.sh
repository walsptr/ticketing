#!/usr/bin/env bash
set -euo pipefail

# Ambil argumen pertama sebagai nama schema
raw_name="${1-}"

# Jika kosong -> tampilkan pesan & keluar gagal
if [[ -z "$raw_name" ]]; then
  echo "❌ Nama seeder wajib diisi."
  echo "   Contoh: npm run generate:seeders users"
  exit 1
fi

# Normalisasi: lowercase, spasi -> underscore, buang karakter aneh
name="$(printf '%s' "$raw_name" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[[:space:]]+/_/g; s/[^a-zA-Z0-9_-]//g; s/^_+|_+$//g')"

if [[ -z "$name" ]]; then
  echo "❌ Nama seeder tidak valid setelah normalisasi."
  exit 1
fi

# mkdir -p db
ts="$(date +%s)"
file="lib/db/seeders/${ts}_${name}.ts"

# Antisipasi tabrakan (sangat jarang)
if [[ -e "$file" ]]; then
  ts="$((ts + 1))"
  file="lib/db/seeders/${ts}_${name}.ts"
fi

# Buat file kosong (atau isi template kalau mau)
: > "$file"

echo "✅ Dibuat: $file"

cat > "$file" <<EOL
import { db } from "../../../config/db";
import { fakerID_ID as faker } from "@faker-js/faker";

export async function up() {}

export async function down() {}
EOL
