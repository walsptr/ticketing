#!/usr/bin/env bash
set -euo pipefail

# Ambil argumen pertama sebagai nama schema
rawNameSchema="${1-}"

# Jika kosong -> tampilkan pesan & keluar gagal
if [[ -z "$rawNameSchema" ]]; then
  echo "❌ Nama schema wajib diisi."
  echo "   Contoh: npm run generate:schemas users"
  exit 1
fi

# === helpers ===
to_snake() {
  # lowercase -> snake_case (hapus spasi/karakter aneh)
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[[:space:]]+/_/g; s/[^a-z0-9_]+//g; s/^_+|_+$//g; s/__+/_/g'
}

to_pascal() {
  # snake_case -> PascalCase
  awk -F'_' '{
    out="";
    for (i=1;i<=NF;i++){
      if ($i=="") continue;
      first=toupper(substr($i,1,1));
      rest=substr($i,2);
      out=out first rest
    }
    print out
  }' <<< "$1"
}

to_singular_pascal() {
  awk -F'_' '{
    out="";
    for (i=1;i<=NF;i++){
      if ($i=="") continue;
      word=$i
      # buang trailing 's' kalau ada (singular sederhana)
      if (word ~ /s$/) {
        word=substr(word, 1, length(word)-1)
      }
      first=toupper(substr(word,1,1));
      rest=substr(word,2);
      out=out first rest
    }
    print out
  }' <<< "$1"
}

to_camel() {
  awk -F'_' '{
    out="";
    for (i=1;i<=NF;i++){
      if ($i=="") continue;
      first=(i==1 ? tolower(substr($i,1,1)) : toupper(substr($i,1,1)));
      rest=substr($i,2);
      out=out first rest
    }
    print out
  }' <<< "$1"
}

append_export_once() {
  local file="$1"
  local line="$2"
  # buat file kalau belum ada
  [[ -f "$file" ]] || : > "$file"
  # tambahkan hanya kalau belum ada
  if ! grep -qxF "$line" "$file" 2>/dev/null; then
    echo "$line" >> "$file"
  fi
}

# === normalize ===
schema_snake="$(to_snake "$rawNameSchema")"
if [[ -z "$schema_snake" ]]; then
  echo "❌ Nama schema tidak valid setelah normalisasi."
  exit 1
fi
schema_camel="$(to_camel "$schema_snake")"
model_pascal="$(to_singular_pascal  "$schema_snake")"

# === paths ===
schemaDir="lib/db/schemas"
modelDir="lib/db/models"

ts="$(date +%s)"
schema_basename="${ts}_${schema_snake}"
model_basename="${model_pascal}"

schema_path="${schemaDir}/${schema_basename}.ts"
model_path="${modelDir}/${model_basename}.ts"
schema_index_path="${schemaDir}/index.ts"
model_index_path="${modelDir}/index.ts"

# === create schema file (template ringan) ===
if [[ -e "$schema_path" ]]; then
  echo "⚠️  Schema sudah ada: $schema_path"
else
  cat > "$schema_path" <<EOF
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

// TODO: sesuaikan kolom sesuai kebutuhanmu
export const ${schema_camel} = pgTable("${schema_snake}", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
EOF
  echo "✅ Dibuat schema: $schema_path"
fi

# === create model file (template ringan) ===
if [[ -e "$model_path" ]]; then
  echo "⚠️  Model sudah ada: $model_path"
else
  cat > "$model_path" <<EOF
export type ${model_pascal} = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
EOF
  echo "✅ Dibuat model:  $model_path"
fi

# === update barrel index (tanpa duplikasi) ===
append_export_once "$schema_index_path" "export * from './${schema_basename}';"
append_export_once "$model_index_path" "export * from './${model_basename}';"

echo "🎉 Selesai."
