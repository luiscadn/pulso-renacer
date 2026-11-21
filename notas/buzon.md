# Notas del agente buzon
## CAMBIO-COMPARTIDO-PROPUESTO
- `/inicio`: mostrar el contador de propuestas pendientes (SPEC §6.4). Se puede usar `listarBandeja("pendientes")` de `src/features/buzon/queries.ts` (`cuentas.pendientes`).
- `scripts/db-local.sh`: `prisma db seed` no lee `.env.local`; tuve que exportar las variables (`set -a; . ./.env.local`) antes de sembrar.
