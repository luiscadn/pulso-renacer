# Notas del agente tablero

## CAMBIO-COMPARTIDO-PROPUESTO
- `src/components/ui/StatCard.tsx` define su propio `EstadoIndicador`; `features/tablero/metricas.ts` exporta el mismo tipo. Convendría que `metricas.ts` lo importe de la UI o viceversa (hoy son idénticos).
- `scripts/db-local.sh`: `tsx` no lee `.env`, así que `npm run db:seed:demo` falla con «DATABASE_URL not found» si no se exporta antes (`set -a; . ./.env.local; set +a`).

## Decisiones
- Porcentajes de 0 a 100; los 15 días de I16 incluyen el día 15 (vence cuando hoy > fecha + 15).
- I9 compara el **porcentaje** de consultas de producto/promoción (no el conteo) porque P y B pueden durar distinto.
- I7: el estado es el peor entre p6 y p7, usando solo los que superan el umbral; si p7 es insuficiente se muestra «Datos insuficientes» en su línea.
- I10 e I15 vienen de Ajustes/actas y no se ocultan por umbral (no son datos de personas).
- I1 e I9 sin línea base suficiente → «insuficiente» (no se puede comparar).
- El QR apunta a `/ingresar`; nunca incluye códigos de acceso.
