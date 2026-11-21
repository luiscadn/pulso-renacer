# Fase 1 · Agente PULSO-CÍRCULOS — rama `feat/pulso-circulos` — puerto 3004

Primero lee y aplica `prompts/_comun-fase1.md`.

## Objetivo
La medición de percepción (pulso semanal, que repite los ítems de la encuesta 2) y las tácticas **B1** (círculo quincenal de
bienestar) y **B2** (mediación neutral), según SPEC §6.5 y §6.6. La sensación que debe dar es de seguridad: el equipo tiene que
*sentir* que es anónimo, porque lo es.

## Entregables
### Pulso — `src/features/pulso/`
- `(app)/pulso`: el consentimiento arriba, en lenguaje simple. Luego las 6 afirmaciones (`PREGUNTAS_PULSO` p1–p6 de `labels.ts`)
  con `Likert`, todas obligatorias, y enviar. La Server Action `responderPulso` guarda `semana = semanaISO(hoy Bogotá)`,
  `fecha = soloFecha(hoy)` y p1–p6, y pone una cookie `pr_pulso_<semana>`. Si ya respondió esta semana: «Ya respondiste el pulso
  de esta semana. ¡Gracias!», con la fecha del próximo lunes.
- Lo que ve el equipo al final: solo un agradecimiento. **No muestres resultados al equipo** (con n tan pequeño se podría deducir
  quién respondió qué).
- `(app)/gestion/pulso-roles`: p7, con el mismo mecanismo (`RespuestaPulsoRoles`, cookie `pr_pulso_roles_<semana>`).
- Pruebas: validación (rango 1–5, todas requeridas) y `semanaISO` en los bordes de año (en `lib` ya hay pruebas; aquí prueba tu
  uso).

### Círculos y mediaciones — `src/features/circulos/`
- `(app)/circulos` (equipo): las actas en orden descendente, como tarjetas con los 4 apartados e íconos. Encima, «Próximo círculo:
  cada 15 días · 30 minutos · sin pacientes» y el contador `n / metaCirculos`.
- `(app)/gestion/circulos`: pestañas **Actas** (crear o editar, 4 campos de 300 caracteres como máximo con contador y una
  plantilla de ejemplo como placeholder) y **Mediaciones** (crear con la fecha y el resultado; marcar el seguimiento; lista mínima
  **sin texto libre**). Al lado, el protocolo B2 de 5 pasos como guía con checklist local (no se guarda), más la regla «si involucra
  a la administradora, media la propietaria».
- Pruebas: la validación de las actas y la función que cuenta los círculos desde la línea base.
- Demo: `prisma/seed/demo/pulso.ts` con 16 respuestas en 4 semanas (4 por semana), con promedios de línea base parecidos a la
  encuesta 2 (p1≈4,75, p2≈4,0, p3≈3,75, p4≈3,5, p5≈3,25, p6≈3,4) que suben de forma gradual en las semanas 3–4 (p3≈4,25,
  p4≈4,0, p5≈3,75, p6≈4,0). Respuestas enteras. Además, 4 respuestas de roles (p7, de 3 a 4).
  `prisma/seed/demo/circulos.ts`: 2 actas realistas (la segunda, con acuerdos sobre los sábados y el semáforo) y 3 mediaciones
  (2 con acuerdo y seguimiento, 1 en curso).
- `src/features/pulso/ayuda.ts` y `src/features/circulos/ayuda.ts`.
