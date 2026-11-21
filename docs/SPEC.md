# Pulso Renacer — Especificación funcional (fuente de verdad)

## 1. Contexto en una línea por hallazgo → módulo
| Hallazgo del diagnóstico | Táctica de la estrategia | Módulo |
|---|---|---|
| Las dificultades se escalan a la propietaria (75 %) | A1 Mapa de decisiones | `/acudo` |
| La agenda es el principal foco de tensión; recepción–cabinas 3,50 | A4 Semáforo de agendas | `/semaforo` |
| No hay línea base de quién consulta, a quién, ni si hay respuesta | Bitácora (Anexo 2) | `/bitacora` |
| Sugerencias sin retorno | B3 Buzón «Propusiste / Hicimos» | `/buzon`, `/muro`, `/gestion/buzon` |
| Seguridad para disentir 3,25; falta mediación neutral; no hay rituales de escucha | B1 Círculo quincenal, B2 Mediación | `/circulos`, `/gestion/circulos` |
| Hay que medir la percepción en la semana 12 | Pulso semanal (ítems de la encuesta 2) | `/pulso`, `/gestion/pulso-roles` |
| Los indicadores de la Tabla 7 se calculaban a mano | Tablero de indicadores | `/gestion/tablero` |

## 2. Roles y acceso
- `equipo` (ingresa con `TEAM_CODE`): ve el mapa, usa el semáforo, registra y cierra consultas, propone en el buzón, ve el muro,
  responde el pulso y ve las actas.
- `gestion` (ingresa con `ADMIN_CODE`; lo usan la administradora, la secretaria y la propietaria): todo lo anterior, más responder
  el buzón, editar el mapa, registrar actas y mediaciones, responder el pulso de roles, ver el tablero, exportar y entrar a ajustes.
- La sesión es una cookie `pr_session` (JWT HS256, `SESSION_SECRET`, 30 días, httpOnly, secure en producción, sameSite lax).
- El login tiene un límite de 5 intentos por IP cada 10 minutos, en memoria. La IP no se persiste.
- La primera vez que se ingresa se muestra el aviso de privacidad resumido, con un enlace a `/privacidad`, y un botón «Entendido»
  que se recuerda en una cookie.

## 3. Navegación
- `/inicio`: mosaico de botones grandes. Para equipo: ¿A quién acudo? · Avisar retraso · Registrar consulta · Proponer mejora ·
  Propusiste/Hicimos · Pulso semanal · Círculos. Para gestion aparece además una sección «Gestión» con Buzón (y un contador de
  pendientes), Tablero, Círculos y mediaciones, Mapa, Exportar y Ajustes.
- Barra inferior fija (móvil): Inicio · Acudo · Semáforo · Bitácora · Más.
- Encabezado: «Pulso Renacer», el rol actual y la opción «Salir».
- Si `DEMO_MODE=true`: banner fijo superior «Datos de demostración».

## 4. Identidad visual
Spa cálido y sereno. Tokens CSS en `globals.css` (reemplazables por la paleta oficial de Renacer):
`--primario #6B8F71` (salvia) · `--primario-osc #4E6B53` · `--arena #F4EFE6` · `--crema #FBF8F3` · `--texto #2F2A26` ·
`--acento #C9A27E` · `--verde #3E8E5A` · `--amarillo #D9A21B` · `--rojo #C2473A`.
Tipografía: una serif suave para los títulos (por ejemplo, `Fraunces` con `next/font`) e `Inter` para el texto.
Bordes redondeados de 16 px, sombras suaves y mucho espacio en blanco. Contraste AA obligatorio.

## 5. Modelo de datos (Prisma 6 — copiar tal cual)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RolConsultante {
  CABINA
  RECEPCION
  PRESTADORA
}
enum TipoSituacion {
  AGENDA
  PRODUCTO_PROMOCION
  PROTOCOLO
  CONFLICTO
  PERMISO_TURNO
  OTRO
}
enum Destinatario {
  PROPIETARIA
  ADMINISTRADORA
  SECRETARIA
  RECEPCION
  COLABORADORA_ANTIGUA
}
enum Decisor {
  ROL_DELEGADO
  PROPIETARIA
}
enum TiempoRespuesta {
  MISMO_DIA
  MENOS_24H
  MAS_24H
  SIN_RESPUESTA
}
enum MotivoEscalamiento {
  NO_CORRESPONDIA
  ROL_PREFIRIO_NO_DECIDIR
  PIDIO_HABLAR_CON_DUENA
  OTRO
}
enum CategoriaSugerencia {
  CABINA
  AGENDA
  INSUMOS
  PROTOCOLOS
  OTRO
}
enum EstadoSugerencia {
  RECIBIDA
  EN_REVISION
  IMPLEMENTADA
  NO_IMPLEMENTADA
}
enum ColorSemaforo {
  VERDE
  AMARILLO
  ROJO
}
enum MotivoAviso {
  RETRASO_PACIENTE
  REPROGRAMACION
  CABINA_OCUPADA
  OTRO
}
enum ResultadoMediacion {
  EN_CURSO
  ACUERDO
  SIN_ACUERDO_ESCALADA
}

model Consulta {
  id                 String              @id @default(cuid())
  abiertaEn          DateTime            @default(now())
  cerradaEn          DateTime?
  quienConsulta      RolConsultante
  tipo               TipoSituacion
  dirigidaA          Destinatario
  recibioRespuesta   Boolean?
  tiempoRespuesta    TiempoRespuesta?
  decidio            Decisor?
  escalada           Boolean             @default(false)
  motivoEscalamiento MotivoEscalamiento?
  revertida          Boolean             @default(false)
  revertidaPor       Destinatario?
  esDemo             Boolean             @default(false)

  @@index([abiertaEn])
}

model Sugerencia {
  id             String              @id @default(cuid())
  fecha          DateTime            @db.Date
  categoria      CategoriaSugerencia
  texto          String              @db.VarChar(800)
  firma          String?             @db.VarChar(80)
  estado         EstadoSugerencia    @default(RECIBIDA)
  resumenPublico String?             @db.VarChar(200)
  respuesta      String?             @db.VarChar(800)
  respondidaEn   DateTime?           @db.Date
  publicada      Boolean             @default(false)
  esDemo         Boolean             @default(false)

  @@index([fecha])
}

model AvisoAgenda {
  id                  String        @id @default(cuid())
  creadoEn            DateTime      @default(now())
  color               ColorSemaforo
  motivo              MotivoAviso
  minutosRetraso      Int?
  minutosAnticipacion Int
  esDemo              Boolean       @default(false)

  @@index([creadoEn])
}

model RespuestaPulso {
  id     String   @id @default(cuid())
  semana String
  fecha  DateTime @db.Date
  p1     Int
  p2     Int
  p3     Int
  p4     Int
  p5     Int
  p6     Int
  esDemo Boolean  @default(false)

  @@index([semana])
}

model RespuestaPulsoRoles {
  id     String   @id @default(cuid())
  semana String
  fecha  DateTime @db.Date
  p7     Int
  esDemo Boolean  @default(false)
}

model ActaCirculo {
  id        String   @id @default(cuid())
  fecha     DateTime @db.Date
  funciono  String   @db.VarChar(300)
  seTrabo   String   @db.VarChar(300)
  carga     String   @db.VarChar(300)
  acordamos String   @db.VarChar(300)
  esDemo    Boolean  @default(false)
}

model Mediacion {
  id               String             @id @default(cuid())
  fecha            DateTime           @db.Date
  resultado        ResultadoMediacion @default(EN_CURSO)
  seguimientoHecho Boolean            @default(false)
  esDemo           Boolean            @default(false)
}

model SituacionMapa {
  id             String        @id @default(cuid())
  orden          Int
  titulo         String        @db.VarChar(120)
  ejemplo        String        @db.VarChar(300)
  tipo           TipoSituacion
  quienResuelve  String        @db.VarChar(120)
  tiempoEsperado String        @db.VarChar(80)
  cuandoEscalar  String        @db.VarChar(300)
  comoHacerlo    String?       @db.VarChar(300)
  porValidar     Boolean       @default(true)
  activo         Boolean       @default(true)
  actualizadoEn  DateTime      @updatedAt
}

model Ajuste {
  clave String @id
  valor String
}
```
`Ajuste` usa estas claves por defecto (las crea la siembra base si no existen): `lineaBaseInicio` (hoy, en formato ISO de fecha),
`lineaBaseFin` (hoy + 13 días), `umbralAnonimato` = `3`, `metaCirculos` = `6`, `cabinas` = `Cabina 1,Cabina 2,Cabina 3,Láser`,
`kitCabinasActualizadas` = `0`, `kitCabinasTotal` = `4`.

## 6. Módulos

### 6.1 «¿A quién acudo?» (`/acudo`, `/gestion/mapa`) — táctica A1
- Un buscador de texto y chips por tipo de situación. Cada tarjeta muestra el título, un ejemplo, **quién resuelve**, el tiempo
  esperado, **cuándo escalar a la propietaria** y cómo hacerlo.
- Banner: «Versión preliminar. Se valida con el equipo en el taller de roles.» Desaparece si ninguna tarjeta activa está marcada
  `porValidar`.
- Pie fijo: «¿No encuentras tu caso? Registra la consulta en la bitácora y pregúntale a la administradora.»
- `/gestion/mapa`: CRUD de las tarjetas (crear, editar, reordenar con subir/bajar, activar o desactivar, marcar como validada).
- Contenido base: sección 7.

### 6.2 Semáforo de agendas (`/semaforo`) — táctica A4
Formulario de un paso:
- color: Verde (a tiempo) · Amarillo (retraso de hasta 15 minutos) · Rojo (retraso mayor o reprogramación)
- cabina (de `Ajuste.cabinas`) y la hora de la cita afectada. Con esa hora se calcula `minutosAnticipacion` = hora de la cita − ahora,
  en Bogotá, con un mínimo de 0.
- minutos de retraso (para amarillo y rojo), el motivo y la acción propuesta (esperar · iniciar más tarde y acortar · reprogramar ·
  cambiar de cabina).
- iniciales de la paciente (opcional; **nunca se guardan**, solo aparecen en el mensaje).

Al tocar «Generar aviso» se muestra el mensaje listo, por ejemplo:
`🟡 AMARILLO · Cabina 2 · Cita 3:00 p. m. · Paciente M. R. llega ~10 min tarde. Propuesta: iniciar 3:10 y acortar 10 min. Cabina, confirma con 👍`

Botones: **Copiar** y **Enviar por WhatsApp** (`https://wa.me/?text=` con el texto codificado). Cualquiera de los dos registra
un `AvisoAgenda`, sin datos de la paciente. Debajo se muestra la regla: «Avisa con al menos 15 minutos de anticipación».

### 6.3 Bitácora de consultas (`/bitacora`) — Anexo 2
- **Nueva consulta** (3 toques, con tarjetas grandes): quién consulta (Cabina / Recepción / Prestadora) → tipo → a quién se dirigió
  primero. Queda abierta con `abiertaEn = now`.
- **Consultas abiertas**: lista con la antigüedad («hace 2 h») y el aviso «más de 24 h» en rojo. Desde ahí se cierra.
- **Cerrar**: ¿recibió respuesta? (sí/no) · ¿quién decidió finalmente? (rol delegado / propietaria) · ¿se escaló a la propietaria?
  y el motivo. `tiempoRespuesta` se calcula en Bogotá así: sin respuesta → SIN_RESPUESTA; mismo día calendario → MISMO_DIA;
  menos de 24 h → MENOS_24H; en otro caso → MAS_24H.
- **Registrar una consulta ya resuelta** (retroactiva): mismos campos, con la fecha y el tiempo de respuesta elegidos a mano.
- **Marcar como revertida**: sobre las consultas cerradas en los últimos 30 días que decidió un rol delegado. Pide quién la revirtió.
- Aviso permanente: «No escribas nombres de pacientes ni de compañeras. Aquí solo se registran roles.»

### 6.4 Buzón «Propusiste / Hicimos» (`/buzon`, `/muro`, `/gestion/buzon`) — táctica B3
- `/buzon`: categoría, texto (máximo 800 caracteres, con contador) y el interruptor «Firmar mi propuesta» (si se activa, pide un
  nombre de máximo 80 caracteres). Avisos: «Evita nombres de compañeras o pacientes. Los temas entre personas se hablan en privado
  con la administradora (mediación).» Al enviar: «Recibimos tu propuesta. Te respondemos a más tardar el {fecha + 15 días}.»
  `fecha` guarda **solo el día**.
- `/muro`: las sugerencias publicadas, en tarjetas «Propusiste: {resumenPublico}» / «Hicimos: {respuesta}» con un chip de estado
  y la fecha de respuesta. Nunca muestra el texto original ni la firma.
- `/gestion/buzon`: bandeja ordenada por fecha límite, con chips de cuenta regresiva (verde si faltan más de 5 días, amarillo si
  faltan 5 o menos, rojo si está vencida). Allí se edita el estado, el resumen público (parafraseado, sin datos identificables), la
  respuesta y la opción de publicar. Al guardar una respuesta se fija `respondidaEn = hoy`. Contador de pendientes en `/inicio`.

### 6.5 Pulso semanal (`/pulso`, `/gestion/pulso-roles`) — medición de percepción
- Seis afirmaciones en una escala del 1 al 5 (1 = total desacuerdo, 5 = total acuerdo), con botones grandes:
  - p1 «Cuando tengo una duda operativa sé con claridad a quién acudir antes de recurrir a la propietaria.»
  - p2 «Las instrucciones de la administración y la recepción son claras, oportunas y respetadas.»
  - p3 «Cuento con acceso diario y visible a promociones vigentes, productos agotados y protocolos de cabina.»
  - p4 «La comunicación entre recepción y cabinas permite gestionar imprevistos sin sobrecarga ni retrasos.»
  - p5 «Siento tranquilidad y apertura para expresar una inconformidad o desacuerdo sin temor a repercusiones.»
  - p6 «Cuando consulto a administración o recepción, recibo una respuesta que resuelve mi situación.»
- `/gestion/pulso-roles`: p7 «Puedo tomar las decisiones de mi cargo sin que sean revertidas.»
- Consentimiento arriba: es voluntario, anónimo, se reporta solo en agregado y no se guarda quién responde.
- Se responde una vez por semana ISO (de Bogotá) por dispositivo. Una cookie lo marca; es un control suave, y la interfaz lo dice
  con honestidad. Se guarda `semana` (por ejemplo `2026-W48`) y `fecha` (solo el día).

### 6.6 Círculos y mediaciones (`/circulos`, `/gestion/circulos`) — tácticas B1 y B2
- `/gestion/circulos` → **Nueva acta** del círculo quincenal, con 4 campos de máximo 300 caracteres: Qué funcionó · Qué se trabó ·
  Cómo está la carga · Qué acordamos. Se publica en `/circulos`, que el equipo puede leer.
- **Mediaciones**: un registro mínimo (fecha, resultado y si se hizo el seguimiento a la semana). **Sin nombres ni descripción.**
  Al lado aparece el protocolo B2 como guía con checklist: 1) escuchar a cada parte por separado y en privado; 2) describir los
  hechos sin juicios; 3) buscar un acuerdo; 4) hacer seguimiento a la semana; 5) escalar a la propietaria solo si no hay acuerdo.
  Si el conflicto involucra a la administradora, media la propietaria.
- Contador «Círculos realizados: n / metaCirculos».

### 6.7 Tablero de indicadores (`/gestion/tablero`, `/gestion/tablero/imprimir`, `/gestion/exportar`, `/gestion/ajustes`)
- Selector de periodo P: últimos 14 días (por defecto), últimos 30 días o un rango personalizado. La línea base B sale de `Ajuste`.
- Tarjetas por objetivo (O1, O2, O3) con el valor en P, el valor en B, la meta y el estado (Cumple · En camino · No cumple ·
  Datos insuficientes), más una tendencia semanal pequeña en I1, I2 e I12.
- Regla de anonimato: si el denominador es menor que `umbralAnonimato`, el indicador muestra «Datos insuficientes (n < 3)».
- `/gestion/tablero/imprimir`: versión para imprimir o guardar como PDF (anexo del informe).
- `/gestion/exportar`: CSV por tabla, con UTF-8 BOM para que Excel lo abra bien. **Sugerencias sin `firma`**.
- `/gestion/ajustes`: fechas de la línea base, umbral de anonimato, meta de círculos, lista de cabinas, kit (cabinas actualizadas
  y total). Si `DEMO_MODE=true`, también los botones «Cargar datos de demostración» y «Borrar datos de demostración» (`esDemo`).

## 6.8 Indicadores (fórmulas exactas; solo cuentan las filas que pasan `filtroDemo()`)
| Id | Objetivo / táctica | Fórmula | Meta |
|---|---|---|---|
| I1 | O1 · A1 uso | % de consultas en P con `dirigidaA = PROPIETARIA` | ≤ 50 % del valor en B |
| I2 | O1 respuesta | consultas cerradas con `recibioRespuesta = true` / consultas en P (excluye las abiertas de menos de 24 h; las abiertas de más de 24 h cuentan como sin respuesta) | ≥ 90 % |
| I3 | O1 respuesta | % con `tiempoRespuesta ∈ {MISMO_DIA, MENOS_24H}`, mismo denominador que I2 | ≥ 80 % |
| I4 | O1 decisión | % de las cerradas con `decidio = ROL_DELEGADO` | mayor que en B |
| I5 | O1 decisión | de las que decidió un rol delegado, % con `revertida = false` | ≥ 90 % |
| I6 | O1 escalamiento | % de consultas en P con `escalada = true` (con desglose por motivo) | ≤ 25 % |
| I7 | O1 percepción | promedio de p6 (pulso) · promedio de p7 (roles) | ≥ 4,2 · ≥ 4,0 |
| I8 | O2 · A2/A3 | promedio de p3 y número de respuestas ≤ 3 | ≥ 4,5 y 0 respuestas ≤ 3 |
| I9 | O2 | consultas de tipo `PRODUCTO_PROMOCION` en P frente a B | reducción |
| I10 | O2 · A3 | `kitCabinasActualizadas / kitCabinasTotal` (Ajuste) | 100 % |
| I11 | O3 · A4 | promedio de p4 | ≥ 4,2 |
| I12 | O3 · A4 | % de `AvisoAgenda` en P con `minutosAnticipacion ≥ 15` | ≥ 80 % |
| I13 | O3 · B1/B2 | promedio de p5 y número de respuestas ≤ 2 | ≥ 4,2 y 0 respuestas ≤ 2 |
| I14 | O3 · B2 | mediaciones con `ACUERDO` y `seguimientoHecho` / mediaciones distintas de `EN_CURSO` | ≥ 80 % |
| I15 | O3 · B1 | actas registradas desde `lineaBaseInicio` / `metaCirculos` | 6 de 6 |
| I16 | O3 · B3 | sugerencias respondidas en 15 días o menos / sugerencias cuyo plazo ya venció o que ya fueron respondidas | 100 % |

Toda la lógica de indicadores vive en funciones **puras** (`src/features/tablero/metricas.ts`) que reciben arreglos de filas y
devuelven `{ valor, n, estado, meta }`, con pruebas unitarias para cada indicador y cada borde (n < 3, denominador 0, zona horaria).

## 7. Contenido base del mapa (siembra base; `porValidar = true`)
1. **Una paciente llega tarde y la siguiente cita está encima** · AGENDA · Resuelve: Recepción, según la política de impuntualidad ·
   Tiempo: inmediato · Escala a la propietaria: solo si la paciente rechaza la solución · Cómo: aviso del semáforo amarillo o rojo.
2. **Se agota un producto que está en promoción** · PRODUCTO_PROMOCION · Resuelve: Administración · Tiempo: el mismo día ·
   Escala: no se escala · Cómo: publicar #Agotado en «Renacer al Día» con el producto sustituto.
3. **Desacuerdo con recepción o con una compañera** · CONFLICTO · Resuelve: la administradora media en privado · Tiempo: en la
   semana · Escala: si no hay acuerdo, o media la propietaria si el conflicto involucra a la administradora · Cómo: protocolo de
   mediación de 5 pasos; el tema de fondo se lleva al círculo.
4. **Quiero proponer una mejora (por ejemplo, un protocolo de bioseguridad)** · PROTOCOLO · Resuelve: Administración valida ·
   Tiempo: respuesta en 15 días o menos · Escala: la propietaria aprueba si implica inversión o cambia un procedimiento clínico ·
   Cómo: buzón «Propusiste / Hicimos».
5. **Ingresa una nueva prestadora** · OTRO · Resuelve: la propietaria comunica el ingreso y la administración hace la inducción ·
   Tiempo: el primer día · Escala: no aplica · Cómo: inducción de 15 minutos con el kit de cabina y este mapa.
6. **Tengo una duda sobre un protocolo de cabina o un producto** · PROTOCOLO · Resuelve: primero el kit de cabina; si no está, la
   administradora · Tiempo: el mismo día · Escala: si el caso es clínico o no está en el protocolo.
7. **No sé si una promoción o un precio siguen vigentes** · PRODUCTO_PROMOCION · Resuelve: el canal «Renacer al Día» (#Promo,
   #Precio); si no está, la administración · Tiempo: el mismo día · Escala: no se escala.
8. **Necesito un permiso o un cambio de turno** · PERMISO_TURNO · Resuelve: **por definir en el taller de roles** · Tiempo: por
   definir · Escala: por definir.

## 8. Datos de demostración (`npm run db:seed:demo` o el botón en Ajustes)
Son 4 semanas: las semanas 1 y 2 se parecen a la línea base del diagnóstico (alto escalamiento a la propietaria, respuestas lentas,
pulso parecido a la encuesta 2: p1≈4,75, p2≈4,0, p3≈3,75, p4≈3,5, p5≈3,25) y las semanas 3 y 4 muestran una mejora gradual, aún
sin cumplir todas las metas, para que el tablero se vea realista. Unas 60 consultas, 8 sugerencias (5 respondidas y publicadas,
1 vencida), 25 avisos, 16 respuestas de pulso, 2 actas y 3 mediaciones. La línea base de demo empieza en hoy − 27 días.

## 9. Páginas fijas
- `/ingresar`: el logo o nombre, un campo de código (inputmode numeric si es solo de dígitos; de lo contrario, texto) y el botón
  «Entrar».
- `/privacidad`: aviso de tratamiento de datos (Ley 1581 de 2012). Explica para qué se usan los datos, qué NO se guarda, quién ve
  qué (la propietaria ve solo agregados), la regla de n < 3, cuánto tiempo se conservan (hasta el cierre del piloto, o lo que defina
  la organización) y a quién pedir la eliminación.
- `/ayuda`: compone `features/*/ayuda.ts`. Son las instrucciones de uso por módulo para el equipo y para gestión.
- `/api/health`: `{ ok: true }` y un ping a la BD.
