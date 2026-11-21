#!/usr/bin/env bash
# Uso: bash scripts/db-local.sh <nombre>   → BD renacer_<nombre> en el Postgres local compartido
set -euo pipefail
NOMBRE="${1:-dev}"
DB="renacer_$(echo "$NOMBRE" | tr '-' '_' | tr '[:upper:]' '[:lower:]')"
docker compose up -d --wait db >/dev/null
EXISTE=$(docker compose exec -T db psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB}'" || true)
if [ "$EXISTE" != "1" ]; then
  docker compose exec -T db psql -U postgres -c "CREATE DATABASE ${DB}" >/dev/null
fi
cat > .env.local <<ENV
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${DB}
SESSION_SECRET=dev-secret-local-no-usar-en-produccion-0123456789
TEAM_CODE=2026
ADMIN_CODE=renacer-gestion
DEMO_MODE=true
ENV
cp .env.local .env   # Prisma CLI lee .env
if [ -d prisma/migrations ]; then npx prisma migrate deploy; fi
if npm run | grep -q "db:seed:demo"; then npm run db:seed:demo; fi
echo "✅ BD ${DB} lista. Códigos locales → equipo: 2026 · gestión: renacer-gestion"
