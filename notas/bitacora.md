# Notas del agente bitácora
- Sin cambios compartidos propuestos. `horaDeDiaBogota` (hora de un día en Bogotá) vive en `features/bitacora/logica.ts`.
- Idea opcional (CAMBIO-COMPARTIDO-PROPUESTO): mover `horaDeDiaBogota` a `src/lib/fechas.ts` si otro módulo la necesita.
- Para el tablero: `Consulta.abiertaEn`/`cerradaEn` en «Ya resuelta» se derivan del día elegido (mediodía de Bogotá) y del tiempo de respuesta elegido a mano; `tiempoRespuesta` es la fuente de verdad.
