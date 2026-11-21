#!/usr/bin/env bash
# Fase 1: crea un git worktree + rama por módulo y lanza un agente de Claude Code en segundo plano dentro de cada uno.
# Variables opcionales:  MODO=acceptEdits|auto|bypassPermissions   MODELO=opus|sonnet   SOLO="02-bitacora 03-buzon"
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
RAIZ="$(pwd)"
MODO="${MODO:-acceptEdits}"
MODULOS="${SOLO:-01-mapa-semaforo 02-bitacora 03-buzon 04-pulso-circulos 05-tablero}"

git switch main >/dev/null 2>&1 && git pull --ff-only
[ -f prisma/schema.prisma ] || { echo "❌ Primero termina la fase 0 (no existe prisma/schema.prisma)"; exit 1; }
docker compose up -d --wait db

for m in $MODULOS; do
  nombre="${m#*-}"
  rama="feat/${nombre}"
  dir="${RAIZ}/.claude/worktrees/${nombre}"
  if [ ! -d "$dir" ]; then
    if git show-ref --verify --quiet "refs/heads/${rama}"; then
      git worktree add "$dir" "$rama"
    else
      git worktree add "$dir" -b "$rama" main
    fi
  fi
  instr="Eres el agente '${nombre}'. Ya estás en tu worktree, en la rama ${rama}. Lee prompts/_comun-fase1.md y luego ejecuta al pie de la letra prompts/${m}.md. Trabaja de forma autónoma hasta hacer push de tu rama y abrir el PR."
  extra=(--permission-mode "$MODO")
  [ -n "${MODELO:-}" ] && extra+=(--model "$MODELO")
  (
    cd "$dir"
    if ! claude --bg --name "$nombre" "${extra[@]}" "$instr"; then
      echo "⚠️  Reintentando '$nombre' sin flags extra (usa defaultMode de .claude/settings.json)…"
      claude --bg --name "$nombre" "$instr"
    fi
  )
  sleep 5
done

echo ""
echo "✅ Agentes lanzados. Monitorea con:  claude agents   ·   claude logs <nombre>   ·   claude attach <nombre>"
echo "   Si uno se queda esperando un permiso: claude attach <nombre> y apruébalo."
echo "   Si alguno no arranca por 'workspace trust': cd .claude/worktrees/<nombre> && claude   (acepta y sal), y reintenta con SOLO=\"<NN-modulo>\"."
