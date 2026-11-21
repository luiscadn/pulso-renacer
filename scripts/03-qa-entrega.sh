#!/usr/bin/env bash
# Fase 3: pruebas E2E, capturas, manual de uso, ficha técnica, QR y guion de demo.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git switch main && git pull --ff-only
claude -n qa-entrega "Ejecuta al pie de la letra las instrucciones de prompts/07-qa-entrega.md. Usa subagentes en paralelo."
