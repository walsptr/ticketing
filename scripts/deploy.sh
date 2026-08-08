#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ENV_FILE:-${PROJECT_ROOT}/.env}"

NETWORK_NAME="${NETWORK_NAME:-ticketing-net}"
DB_VOLUME_NAME="${DB_VOLUME_NAME:-ticketing-postgres-data}"
DB_CONTAINER_NAME="${DB_CONTAINER_NAME:-ticketing-postgres}"
APP_CONTAINER_NAME="${APP_CONTAINER_NAME:-ticketing-app}"
APP_IMAGE_NAME="${APP_IMAGE_NAME:-ticketing-app:local}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-docker.io/library/postgres:16-alpine}"

CONTAINER_CLI=""

log() {
  printf '[ticketing] %s\n' "$*"
}

die() {
  printf '[ticketing] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Command '$1' tidak ditemukan."
}

require_env_file() {
  [[ -f "${ENV_FILE}" ]] || die "File env tidak ditemukan: ${ENV_FILE}. Copy dari .env.example terlebih dahulu."
}

resolve_runtime() {
  if [[ -n "${RUNTIME_FLAG:-}" ]]; then
    CONTAINER_CLI="${RUNTIME_FLAG}"
  elif [[ -n "${CONTAINER_RUNTIME:-}" ]]; then
    CONTAINER_CLI="${CONTAINER_RUNTIME}"
  else
    if command -v docker >/dev/null 2>&1; then
      CONTAINER_CLI="docker"
    elif command -v podman >/dev/null 2>&1; then
      CONTAINER_CLI="podman"
    else
      die "Docker dan Podman tidak terinstall."
    fi
  fi

  require_command "$CONTAINER_CLI"
}

cli_network_exists() {
  local net="$1"
  if [[ "$CONTAINER_CLI" == "podman" ]]; then
    "$CONTAINER_CLI" network exists "$net"
  else
    "$CONTAINER_CLI" network inspect "$net" >/dev/null 2>&1
  fi
}

cli_container_exists() {
  local name="$1"
  if [[ "$CONTAINER_CLI" == "podman" ]]; then
    "$CONTAINER_CLI" container exists "$name"
  else
    "$CONTAINER_CLI" inspect "$name" >/dev/null 2>&1
  fi
}

cli_volume_exists() {
  local vol="$1"
  if [[ "$CONTAINER_CLI" == "podman" ]]; then
    "$CONTAINER_CLI" volume exists "$vol"
  else
    "$CONTAINER_CLI" volume inspect "$vol" >/dev/null 2>&1
  fi
}

cli_image_exists() {
  local image="$1"
  if [[ "$CONTAINER_CLI" == "podman" ]]; then
    "$CONTAINER_CLI" image exists "$image"
  else
    "$CONTAINER_CLI" image inspect "$image" >/dev/null 2>&1
  fi
}

load_env() {
  require_env_file
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a

  : "${POSTGRES_DB:?POSTGRES_DB wajib diisi}"
  : "${POSTGRES_USER:?POSTGRES_USER wajib diisi}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD wajib diisi}"
  : "${POSTGRES_PORT:?POSTGRES_PORT wajib diisi}"
  : "${APP_PORT:?APP_PORT wajib diisi}"
  : "${DATABASE_URL:?DATABASE_URL wajib diisi}"
  : "${JWT_SECRET:?JWT_SECRET wajib diisi}"

  export DATABASE_SSL="${DATABASE_SSL:-false}"
  export COOKIE_SECURE="${COOKIE_SECURE:-false}"
  export MASKING_PROPS="${MASKING_PROPS:-}"
  export CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:-}"
  export CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY:-}"
  export CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET:-}"
}

ensure_network() {
  if ! cli_network_exists "${NETWORK_NAME}"; then
    log "Membuat network ${NETWORK_NAME}"
    "$CONTAINER_CLI" network create "${NETWORK_NAME}" >/dev/null
  fi
}

ensure_volume() {
  if ! cli_volume_exists "${DB_VOLUME_NAME}"; then
    log "Membuat volume ${DB_VOLUME_NAME}"
    "$CONTAINER_CLI" volume create "${DB_VOLUME_NAME}" >/dev/null
  fi
}

remove_container_if_exists() {
  local name="$1"
  if cli_container_exists "${name}"; then
    log "Menghapus container lama ${name}"
    "$CONTAINER_CLI" rm -f "${name}" >/dev/null
  fi
}

build_image() {
  local target_image="localhost/ticketing-app:local"
  if cli_image_exists "${target_image}"; then
    log "Menghapus image app lama localhost/ticketing-app:local untuk rebuild fresh"
    "$CONTAINER_CLI" rmi -f "localhost/ticketing-app:local" >/dev/null
  fi
  log "Build image aplikasi ${APP_IMAGE_NAME}"
  "$CONTAINER_CLI" build -t "${APP_IMAGE_NAME}" "${PROJECT_ROOT}"
}

run_postgres() {
  remove_container_if_exists "${DB_CONTAINER_NAME}"
  log "Menjalankan Postgres ${DB_CONTAINER_NAME}"
  "$CONTAINER_CLI" run -d \
    --name "${DB_CONTAINER_NAME}" \
    --network "${NETWORK_NAME}" \
    -p "${POSTGRES_PORT}:5432" \
    -v "${DB_VOLUME_NAME}:/var/lib/postgresql/data:Z" \
    -e POSTGRES_DB="${POSTGRES_DB}" \
    -e POSTGRES_USER="${POSTGRES_USER}" \
    -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
    "${POSTGRES_IMAGE}" >/dev/null
}

wait_for_postgres() {
  log "Menunggu Postgres siap"
  local retries=30
  local attempt=1

  while (( attempt <= retries )); do
    if "$CONTAINER_CLI" exec "${DB_CONTAINER_NAME}" pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
      log "Postgres siap"
      return 0
    fi

    sleep 2
    attempt=$((attempt + 1))
  done

  die "Postgres tidak siap setelah menunggu."
}

apply_schema() {
  log "Menerapkan schema database dari drizzle SQL"
  "$CONTAINER_CLI" exec -i "${DB_CONTAINER_NAME}" psql \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" < "${PROJECT_ROOT}/drizzle/0000_mature_skullbuster.sql"
}

run_seed() {
  log "Menjalankan seed database"
  "$CONTAINER_CLI" run --rm \
    --network "${NETWORK_NAME}" \
    --env-file "${ENV_FILE}" \
    -e DATABASE_SSL="${DATABASE_SSL}" \
    -e COOKIE_SECURE="${COOKIE_SECURE}" \
    -e NODE_ENV=production \
    "${APP_IMAGE_NAME}" \
    npm run db:seed
}

run_app() {
  remove_container_if_exists "${APP_CONTAINER_NAME}"
  log "Menjalankan aplikasi ${APP_CONTAINER_NAME}"
  "$CONTAINER_CLI" run -d \
    --name "${APP_CONTAINER_NAME}" \
    --network "${NETWORK_NAME}" \
    -p "${APP_PORT}:3000" \
    --env-file "${ENV_FILE}" \
    -e DATABASE_SSL="${DATABASE_SSL}" \
    -e COOKIE_SECURE="${COOKIE_SECURE}" \
    -e NODE_ENV=production \
    "${APP_IMAGE_NAME}" >/dev/null
}

show_status() {
  log "Status container"
  "$CONTAINER_CLI" ps --filter "name=${DB_CONTAINER_NAME}" --filter "name=${APP_CONTAINER_NAME}"
  log "Aplikasi tersedia di http://localhost:${APP_PORT}"
}

bootstrap() {
  resolve_runtime
  load_env
  ensure_network
  ensure_volume
  build_image
  run_postgres
  wait_for_postgres
  apply_schema
  run_seed
  run_app
  show_status
}

up() {
  resolve_runtime
  load_env
  ensure_network
  ensure_volume
  build_image
  if ! cli_container_exists "${DB_CONTAINER_NAME}"; then
    run_postgres
    wait_for_postgres
  else
    log "Container Postgres sudah ada, melewati bootstrap database"
  fi
  run_app
  show_status
}

down() {
  resolve_runtime
  local remove_volumes="${1:-false}"
  remove_container_if_exists "${APP_CONTAINER_NAME}"
  remove_container_if_exists "${DB_CONTAINER_NAME}"
  if [[ "${remove_volumes}" == "true" ]]; then
    if cli_volume_exists "${DB_VOLUME_NAME}"; then
      log "Menghapus volume ${DB_VOLUME_NAME}"
      "$CONTAINER_CLI" volume rm -f "${DB_VOLUME_NAME}" >/dev/null
    fi
    log "Container dihentikan. Volume ${DB_VOLUME_NAME} juga dihapus."
    return 0
  fi

  log "Container dihentikan. Volume ${DB_VOLUME_NAME} tetap dipertahankan."
}

logs() {
  resolve_runtime
  "$CONTAINER_CLI" logs -f "${APP_CONTAINER_NAME}"
}

status() {
  resolve_runtime
  load_env
  show_status
}

seed() {
  resolve_runtime
  load_env
  run_seed
}

usage() {
  cat <<EOF
Usage: bash scripts/deploy.sh [--runtime=docker|podman] <command> [options]

Commands:
  bootstrap   Build image, start Postgres, apply schema, seed, lalu run app
  up          Build image dan jalankan ulang app/container yang diperlukan
  down        Stop dan hapus container app + postgres
  logs        Tampilkan log aplikasi
  seed        Jalankan ulang seed database
  status      Tampilkan status container

Options:
  --runtime=docker|podman  Override pemilihan container runtime
  --volumes                 Khusus untuk command down, hapus volume database juga

Environment:
  CONTAINER_RUNTIME         Override container runtime (docker atau podman)
  ENV_FILE                  Path ke file env. Default: ${PROJECT_ROOT}/.env
EOF
}

main() {
  RUNTIME_FLAG=""
  local command=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --runtime=*)
        local runtime_value="${1#--runtime=}"
        if [[ "${runtime_value}" != "docker" && "${runtime_value}" != "podman" ]]; then
          die "Runtime tidak didukung: ${runtime_value}. Pilih 'docker' atau 'podman'."
        fi
        RUNTIME_FLAG="${runtime_value}"
        shift
        ;;
      --*)
        die "Flag tidak dikenal: $1"
        ;;
      *)
        command="$1"
        shift
        break
        ;;
    esac
  done

  local option="${1:-}"

  case "${command}" in
    bootstrap) bootstrap ;;
    up) up ;;
    down)
      case "${option}" in
        "") down "false" ;;
        --volumes) down "true" ;;
        *) die "Opsi tidak dikenal untuk command down: ${option}" ;;
      esac
      ;;
    logs) logs ;;
    seed) seed ;;
    status) status ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
