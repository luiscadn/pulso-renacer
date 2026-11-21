#!/usr/bin/env bash
# Fase 2: fusiona los 5 PRs en main, corrige y despliega.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
gh pr list --state open
claude --model "${MODELO:-sonnet}" -n integrador "Ejecuta al pie de la letra las instrucciones de prompts/06-integrador.md. Trabaja de forma autónoma."
