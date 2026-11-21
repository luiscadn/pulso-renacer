# Notas del agente pulso-circulos

## CAMBIO-COMPARTIDO-PROPUESTO
- `/inicio` y `/ayuda` (congelados) ya enlazan a `/pulso`, `/circulos` y `/gestion/circulos`; no hace falta tocar nada. Solo confirmar
  que `/ayuda` importa `features/pulso/ayuda.ts` y `features/circulos/ayuda.ts`.
- El tablero puede reutilizar `contarCirculos(fechas, lineaBaseInicio)` de `src/features/circulos/conteo.ts` para I15 (o reimplementarlo).
- Las acciones de actas/mediaciones llaman `revalidatePath("/gestion/tablero")`.

## Decisiones
- Pulso: la cookie `pr_pulso_<semana>` solo guarda «1». Las respuestas reales no se marcan `esDemo`.
- No se muestran resultados al equipo, solo agradecimiento.
- Pestañas de `/gestion/circulos` por `?tab=` (sin JS); editar acta con `?editar=<id>`.
