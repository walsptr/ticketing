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
  if ! podman network exists "${NETWORK_NAME}"; then
    log "Membuat network ${NETWORK_NAME}"
    podman network create "${NETWORK_NAME}" >/dev/null
  fi
}

ensure_volume() {
  if ! podman volume exists "${DB_VOLUME_NAME}"; then
    log "Membuat volume ${DB_VOLUME_NAME}"
    podman volume create "${DB_VOLUME_NAME}" >/dev/null
  fi
}

remove_container_if_exists() {
  local name="$1"
  if podman container exists "${name}"; then
    log "Menghapus container lama ${name}"
    podman rm -f "${name}" >/dev/null
  fi
}

build_image() {
  log "Build image aplikasi ${APP_IMAGE_NAME}"
  podman build -t "${APP_IMAGE_NAME}" "${PROJECT_ROOT}"
}

run_postgres() {
  remove_container_if_exists "${DB_CONTAINER_NAME}"
  log "Menjalankan Postgres ${DB_CONTAINER_NAME}"
  podman run -d \
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
    if podman exec "${DB_CONTAINER_NAME}" pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
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
  podman exec -i "${DB_CONTAINER_NAME}" psql \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" < "${PROJECT_ROOT}/drizzle/0000_mature_skullbuster.sql"
}

run_seed() {
  log "Menjalankan seed database"
  podman run --rm \
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
  podman run -d \
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
  podman ps --filter "name=${DB_CONTAINER_NAME}" --filter "name=${APP_CONTAINER_NAME}"
  log "Aplikasi tersedia di http://localhost:${APP_PORT}"
}

bootstrap() {
  require_command podman
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
  require_command podman
  load_env
  ensure_network
  ensure_volume
  build_image
  if ! podman container exists "${DB_CONTAINER_NAME}"; then
    run_postgres
    wait_for_postgres
  else
    log "Container Postgres sudah ada, melewati bootstrap database"
  fi
  run_app
  show_status
}

down() {
  require_command podman
  local remove_volumes="${1:-false}"
  remove_container_if_exists "${APP_CONTAINER_NAME}"
  remove_container_if_exists "${DB_CONTAINER_NAME}"
  if [[ "${remove_volumes}" == "true" ]]; then
    if podman volume exists "${DB_VOLUME_NAME}"; then
      log "Menghapus volume ${DB_VOLUME_NAME}"
      podman volume rm -f "${DB_VOLUME_NAME}" >/dev/null
    fi
    log "Container dihentikan. Volume ${DB_VOLUME_NAME} juga dihapus."
    return 0
  fi

  log "Container dihentikan. Volume ${DB_VOLUME_NAME} tetap dipertahankan."
}

logs() {
  require_command podman
  podman logs -f "${APP_CONTAINER_NAME}"
}

status() {
  require_command podman
  load_env
  show_status
}

seed() {
  require_command podman
  load_env
  run_seed
}

usage() {
  cat <<EOF
Usage: bash scripts/deploy-podman.sh <command> [options]

Commands:
  bootstrap   Build image, start Postgres, apply schema, seed, lalu run app
  up          Build image dan jalankan ulang app/container yang diperlukan
  down        Stop dan hapus container app + postgres
  logs        Tampilkan log aplikasi
  seed        Jalankan ulang seed database
  status      Tampilkan status container

Options:
  --volumes   Khusus untuk command down, hapus volume database juga

Environment:
  ENV_FILE    Path ke file env. Default: ${PROJECT_ROOT}/.env
EOF
}

main() {
  local command="${1:-}"
  local option="${2:-}"

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
