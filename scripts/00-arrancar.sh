#!/usr/bin/env bash
# Fase 0: crea el repo en GitHub, levanta Postgres local y lanza el agente de fundación.
# Uso: bash scripts/00-arrancar.sh [nombre-repo]
set -euo pipefail
REPO="${1:-pulso-renacer}"
cd "$(dirname "$0")/.."

for bin in git gh docker node npm claude; do
  command -v "$bin" >/dev/null || { echo "❌ Falta '$bin' en el PATH"; exit 1; }
done
gh auth status >/dev/null || { echo "❌ Corre 'gh auth login' primero"; exit 1; }
docker info >/dev/null 2>&1 || { echo "❌ Abre Docker Desktop primero"; exit 1; }

[ -d .git ] || git init -b main
git add -A
git commit -m "chore: kit de arranque (especificación, prompts, despliegue)" || true
if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$REPO" --private --source=. --remote=origin --push
else
  git push -u origin main
fi

docker compose up -d --wait db
echo "✅ Repo y Postgres listos. Lanzando el agente de fundación (acepta la confianza del directorio si te la pide)…"
claude --model "${MODELO:-sonnet}" -n fundacion "Ejecuta al pie de la letra las instrucciones de prompts/00-fundacion.md. Trabaja de forma autónoma hasta el push a main y el resumen final."
