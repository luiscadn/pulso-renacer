# Fase 1 · Agente BUZÓN — rama `feat/buzon` — puerto 3003

Primero lee y aplica `prompts/_comun-fase1.md`.

## Objetivo
La táctica **B3**: cerrar el ciclo de las «sugerencias sin retorno» con el buzón «Propusiste / Hicimos» (SPEC §6.4). El valor
cultural está en la **transparencia del compromiso**: cada propuesta tiene una fecha límite visible y una respuesta pública.

## Entregables — `src/features/buzon/`
- `(app)/buzon`: el formulario de SPEC §6.4 (categoría con `ChoiceCards`, `Textarea` con contador de 800, interruptor de firma) y
  los avisos de privacidad y mediación. La Server Action `enviarSugerencia` guarda `fecha = soloFecha(hoy Bogotá)` y **nada más
  que los campos del schema**. La confirmación muestra la fecha límite en español («martes 8 de diciembre»).
- `(app)/muro`: las tarjetas «Propusiste / Hicimos» (solo `publicada = true`), con un chip de estado y la fecha. Encima, un resumen:
  «X propuestas recibidas · Y respondidas a tiempo». Ese conteo usa la regla de anonimato si n < 3. Estado vacío motivador.
- `(app)/gestion/buzon`: la bandeja con filtros (Pendientes · Vencidas · Respondidas · Todas), ordenada por fecha límite, con
  `Countdown` (verde, amarillo, rojo). El editor de cada sugerencia muestra el texto original y la firma (si existe), el estado, el
  `resumenPublico` (con la ayuda «Parafrasea sin datos que identifiquen a nadie»), la respuesta y el interruptor «Publicar en el
  muro». Para publicar se exigen `resumenPublico` y `respuesta` (validación zod). Al guardar la respuesta se fija
  `respondidaEn = soloFecha(hoy)`.
- `estadoPlazo(fecha, respondidaEn, hoy)` → `'a_tiempo' | 'por_vencer' | 'vencida' | 'respondida_a_tiempo' | 'respondida_tarde'`:
  función pura con pruebas, incluido el borde del día 15 exacto.
- Pruebas de validación: no se puede publicar sin resumen ni respuesta, y la firma se limita a 80 caracteres.
- `prisma/seed/demo/buzon.ts`: 8 sugerencias realistas de spa (bioseguridad en cabina, apoyo en recepción en las horas pico de
  los sábados, reposición de insumos de láser, una plantilla de reprogramación, la rotación de toallas, etc.): 5 respondidas y
  publicadas (4 a tiempo y 1 tarde), 1 vencida sin responder, 1 en revisión y 1 recibida ayer. Que la primera sea la de
  bioseguridad, respondida con «Creamos la ficha de bioseguridad del kit de cabina».
- `src/features/buzon/ayuda.ts`.
