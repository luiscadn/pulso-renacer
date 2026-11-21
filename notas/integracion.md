# Notas del integrador

## Fusiones (en orden)
- PR #1 `feat/buzon`: ya estaba fusionado en `main` antes de empezar (merge en GitHub).
- PR #3 `feat/mapa-semaforo`, PR #2 `feat/bitacora`, PR #4 `feat/pulso-circulos`, PR #5 `feat/tablero`: fusionados con `--no-ff`.
- Conflicto único: `tsconfig.tsbuildinfo` (tablero/bitácora lo modificaron; main lo dejó de rastrear). Se resolvió borrándolo.

## CAMBIO-COMPARTIDO-PROPUESTO aplicados
- `EstadoIndicador` duplicado (UI y `tablero/metricas.ts`): `metricas.ts` ahora lo importa de `components/ui/StatCard`.
- `scripts/db-local.sh`: exporta `.env.local` antes de sembrar (tsx / prisma db seed no lo leen).
- `eslint.config.mjs` ignora `.claude/**` (worktrees de los agentes generaban >60 000 avisos); `*.tsbuildinfo` salió de git.

## No aplicados
- `horaDeDiaBogota` → `src/lib/fechas.ts`: ningún otro módulo la necesita.
- Contador de pendientes en `/inicio`: ya existía (tarjeta «Buzón» de gestión).
- Reusar `contarCirculos` en el tablero: el tablero ya tiene su propio cálculo; sin duplicación problemática.

## Datos demo ajustados
Con el periodo de 14 días, I14 e I16 quedaban «insuficientes» (n < 3). Se añadieron 3 sugerencias recientes respondidas (buzón) y 2 mediaciones
más (círculos): ahora son 11 sugerencias y 5 mediaciones (SPEC §8 decía 8 y 3). Resultado: 5 cumplen · 9 en camino · 2 no cumplen · 0 insuficientes.

## Verificación de privacidad
- Sin `console.log` en `src` (solo en el script de siembra).
- El semáforo no guarda iniciales; el CSV de sugerencias usa `select` sin `firma`; no se guardan IPs (límite de intentos en memoria).
