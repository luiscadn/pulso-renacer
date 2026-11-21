# Fase 1 · Agente MAPA-SEMÁFORO — rama `feat/mapa-semaforo` — puerto 3001

Primero lee y aplica `prompts/_comun-fase1.md`.

## Objetivo
Construir las tácticas **A1** (mapa «¿A quién acudo?») y **A4** (semáforo de agendas) según SPEC §6.1 y §6.2.
Estos dos módulos son la cara visible de la estrategia en la sustentación: tienen que sentirse rápidos, cálidos e impecables en el
celular.

## Entregables
### Mapa — `src/features/mapa/`, ruta `(app)/acudo`, ruta `(app)/gestion/mapa`
- `queries.ts`: situaciones activas ordenadas por `orden`; todas, para gestión.
- `/acudo`: un buscador (cliente, filtra por título, ejemplo y quién resuelve; insensible a tildes y mayúsculas), chips por
  `TipoSituacion` y tarjetas expandibles. Muestra **quién resuelve** y **cuándo escalar a la propietaria**, con jerarquía visual.
  Banner «Versión preliminar…» cuando haya tarjetas `porValidar`. Pie con el enlace a /bitacora.
- `/gestion/mapa`: lista con subir/bajar, activar/desactivar, «Marcar como validada» y un formulario de crear/editar con zod.
  Server Actions con `requireRole('gestion')`.
- Pruebas: la normalización de búsqueda (tildes) y el reordenamiento.

### Semáforo — `src/features/semaforo/`, ruta `(app)/semaforo`
- Formulario de un paso (SPEC §6.2) con `ChoiceCards` para el color (verde, amarillo, rojo, con color e ícono), la cabina desde
  `cabinas()`, la hora de la cita (input `time`), los minutos de retraso (aparecen en amarillo y rojo), el motivo, la acción
  propuesta y las iniciales opcionales.
- `generarMensaje(datos)`: función **pura**, con pruebas para los tres colores, sin iniciales y con la hora en formato
  `3:00 p. m.`.
- `calcularAnticipacion(horaCita, ahora)` en Bogotá, con un mínimo de 0, y pruebas (incluida una cita que ya pasó).
- Vista previa del mensaje, `CopyButton` y «Enviar por WhatsApp» (`https://wa.me/?text=`). Cualquiera de los dos llama a la
  Server Action `registrarAviso` (color, motivo, minutosRetraso, minutosAnticipacion; **jamás las iniciales**).
- Una nota visible: «Avisa con al menos 15 minutos de anticipación». Si la anticipación es menor de 15, se muestra un chip amarillo
  amable: «Aviso con poca anticipación».
- `prisma/seed/demo/semaforo.ts`: unos 25 avisos repartidos en 4 semanas, con la anticipación mejorando (las semanas 1–2 cerca
  del 50 % ≥ 15 min y las semanas 3–4 cerca del 75 %).

### Ayuda
`src/features/mapa/ayuda.ts` y `src/features/semaforo/ayuda.ts`: pasos claros para el equipo y para gestión.
