# Fase 1 · Agente BITÁCORA — rama `feat/bitacora` — puerto 3002

Primero lee y aplica `prompts/_comun-fase1.md`.

## Objetivo
Digitalizar la **bitácora de consultas (Anexo 2)** según SPEC §6.3. Es la línea base de los indicadores I1–I6 y I9: si el registro
es lento, nadie lo va a llenar. **Meta de UX: abrir una consulta en 3 toques y menos de 10 segundos.**

## Entregables — `src/features/bitacora/`, ruta `(app)/bitacora`
- Pestañas o segmentos: **Abiertas** (por defecto) · **Nueva** · **Ya resuelta** · **Recientes** (las cerradas en los últimos
  30 días).
- **Nueva**: un flujo de 3 pasos con `ChoiceCards` (quién consulta → tipo → a quién se dirigió) que avanza solo al tocar, con
  «Atrás» y una confirmación final. Server Action `abrirConsulta`.
- **Abiertas**: tarjetas con el tipo, a quién se dirigió y `formatoRelativo` de `abiertaEn`. Si lleva más de 24 h, chip rojo
  «Más de 24 h sin cerrar». El botón «Cerrar» abre una hoja o diálogo con: ¿recibió respuesta? · ¿quién decidió finalmente? ·
  ¿se escaló a la propietaria? → motivo (si sí). Server Action `cerrarConsulta`, que calcula `tiempoRespuesta` con
  `calcularTiempoRespuesta(abiertaEn, cerradaEn, recibioRespuesta)`.
- **Ya resuelta**: los mismos campos, más la fecha (hasta hace 14 días) y el tiempo de respuesta elegido a mano. Server Action
  `registrarResuelta`.
- **Recientes**: «Marcar como revertida» (solo si `decidio = ROL_DELEGADO`) → quién la revirtió. Server Action `marcarRevertida`.
- Aviso permanente sobre no escribir nombres (SPEC §6.3).
- Pruebas: `calcularTiempoRespuesta` con todos los bordes, incluidos «mismo día en Bogotá pero distinto día en UTC» (por ejemplo,
  abierta a las 18:00 y cerrada a las 20:30 hora de Bogotá), 23 h 59 min, 24 h 01 min y sin respuesta; y la validación zod de cada
  acción (por ejemplo, el motivo es obligatorio si se escaló).
- `prisma/seed/demo/bitacora.ts`: unas 60 consultas en 4 semanas. Semanas 1–2 (línea base): unos 70 % dirigidas a la
  propietaria, 60 % escaladas, 75 % con respuesta y 55 % en 24 h o menos, 35 % decididas por un rol delegado y algunas revertidas.
  Semanas 3–4: una mejora gradual (unos 40 % a la propietaria, 35 % escaladas, 88 % con respuesta, 72 % en 24 h o menos y 60 %
  decididas por un rol delegado). Incluye 3 abiertas recientes y 1 abierta de más de 24 h. Varía `tipo` y `quienConsulta` de forma
  realista: AGENDA y PRODUCTO_PROMOCION son los más frecuentes.
- `src/features/bitacora/ayuda.ts`.
