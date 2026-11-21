# Fase 0 — Fundación (un solo agente, en `main`)

Eres el arquitecto líder de **Pulso Renacer**. Antes de escribir código, lee completos `CLAUDE.md` y `docs/SPEC.md`.
Tu trabajo es dejar una base sólida, desplegable y **congelada**, para que cinco agentes trabajen en paralelo en worktrees sin
pisarse. Trabaja de forma autónoma de principio a fin. No me preguntes nada salvo que estés bloqueado de verdad.
Usa subagentes (Task) cuando te ayude a paralelizar la investigación o la verificación.

## 1. Scaffolding
1. Este repo ya trae archivos del kit (CLAUDE.md, docs/, prompts/, scripts/, render.yaml, docker-compose.yml, .claude/,
   .gitignore). **No los borres ni los sobrescribas.**
2. Genera Next.js en una carpeta temporal y cópialo sin pisar los archivos del kit:
   ```bash
   npx create-next-app@latest /tmp/scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack --yes
   rsync -a --ignore-existing --exclude .git --exclude .gitignore /tmp/scaffold/ ./
   rm -rf /tmp/scaffold
   ```
   Si una opción del CLI no existe en la versión actual, adáptala. El resultado debe ser App Router + TS + Tailwind + `src/`.
3. Dependencias (estas versiones mayores son obligatorias):
   ```bash
   npm i prisma@6 @prisma/client@6 tsx zod jose date-fns @date-fns/tz recharts qrcode lucide-react
   npm i -D vitest @types/qrcode
   ```
   `prisma` y `tsx` van en `dependencies` (no en dev) porque Render ejecuta la migración y la siembra durante el build.
4. Scripts de `package.json`: `dev`, `build`, `start` (`next start`, que respeta `PORT`), `lint`, `typecheck` (`tsc --noEmit`),
   `test` (`vitest run`), `db:migrate` (`prisma migrate dev`), `db:seed` (`tsx prisma/seed/index.ts`),
   `db:seed:demo` (`tsx prisma/seed/index.ts --demo`), `postinstall` (`prisma generate`).

## 2. Base de datos
1. Copia el schema de `docs/SPEC.md §5` **exacto** en `prisma/schema.prisma`.
2. `bash scripts/db-local.sh dev` (levanta Docker y crea `.env`). Luego `npx prisma migrate dev --name init`.
3. Siembra, que debe ser **idempotente** porque Render la ejecuta en cada build:
   - `prisma/seed/index.ts`: siempre ejecuta `seedBase()`. Con `--demo` ejecuta además `seedDemo()`.
   - `prisma/seed/base.ts`: crea las claves de `Ajuste` que falten (SPEC §5) y, **solo si `SituacionMapa` está vacía**, el
     contenido de SPEC §7.
   - `prisma/seed/demo/index.ts`: `seedDemo()` primero borra todo lo que tenga `esDemo=true`, luego llama en orden a
     `seedDemoSemaforo`, `seedDemoBitacora`, `seedDemoBuzon`, `seedDemoPulso` y `seedDemoCirculos`, que importa de
     `prisma/seed/demo/{semaforo,bitacora,buzon,pulso,circulos}.ts`. **Crea esos 5 archivos como stubs** que exportan la función
     async vacía con un `// TODO(agente <modulo>)`, y ajusta `lineaBaseInicio` a hoy − 27 días y `lineaBaseFin` a hoy − 14 días.
   - Exporta también `borrarDemo()` y haz que `seedDemo` y `borrarDemo` se puedan llamar desde una Server Action. Para eso, el
     código compartido va en `src/lib/demo-seed.ts`, que re-exporta o implementa usando `db` de `src/lib/db.ts`.

## 3. Librerías compartidas (`src/lib/`, quedan congeladas después de esta fase)
- `db.ts`: singleton de PrismaClient.
- `auth.ts`: `crearSesion(rol)`, `leerSesion()`, `cerrarSesion()`, `requireRole(rol | rol[])` (redirige a /ingresar), el tipo
  `Rol = 'equipo' | 'gestion'` y `verificarCodigo(codigo)`, que compara en tiempo constante contra `TEAM_CODE` y `ADMIN_CODE`.
  Rate limit en memoria: 5 intentos cada 10 minutos por IP (`x-forwarded-for`), sin persistir nada.
- `src/middleware.ts` (o `src/proxy.ts` si la versión instalada de Next ya usa esa convención): protege todas las rutas salvo `/ingresar`, `/privacidad`, `/api/health`, `/manifest.webmanifest` y los
  estáticos; `/gestion/**` exige `gestion`. (Los grupos `(app)` y `(publico)` no aparecen en la URL.)
- `fechas.ts`: ZONA = 'America/Bogota'; `ahoraBogota()`, `inicioDiaBogota(d)`, `mismoDiaBogota(a,b)`, `semanaISO(d)` →
  `'2026-W48'`, `sumarDias`, `horasEntre`, `soloFecha(d)` (Date a medianoche UTC para columnas `@db.Date`), `formatoCorto(d)` y
  `formatoRelativo(d)` en español («hace 2 h»), y `fechaLimiteSugerencia(fecha)` (+15 días).
- `privacidad.ts`: `umbral()` lee `Ajuste.umbralAnonimato` (por defecto 3); `protegido<T>(n, calcular, umbral)` devuelve
  `{ suficiente: false }` o `{ suficiente: true, valor }`; y `MENSAJE_INSUFICIENTE`.
- `labels.ts`: etiquetas en español para **todos** los enums, más `PREGUNTAS_PULSO` (p1–p7 con el texto exacto de SPEC §6.5).
- `demo.ts`: `esModoDemo()` lee `DEMO_MODE`; `filtroDemo()` devuelve `{}` si es modo demo y `{ esDemo: false }` si no.
- `validacion.ts`: esquemas zod reutilizables (enums, texto acotado, escala 1–5) y un helper `accion()` para Server Actions que
  devuelve `{ ok: true, data } | { ok: false, error }`.
- `ajustes.ts`: `leerAjuste(clave)`, `leerAjustes()`, `cabinas()` (split de la lista).
- Pruebas unitarias en `src/lib/fechas.test.ts` y `src/lib/privacidad.test.ts`, incluido el borde de medianoche en Bogotá frente
  a UTC.

## 4. Design system (`src/components/ui/`, congelado después)
Tokens de SPEC §4 en `globals.css` (variables CSS + tema de Tailwind). Fuentes con `next/font` (Fraunces e Inter).
Componentes accesibles y mobile-first: `Button` (variantes primario, secundario, fantasma, peligro; tamaño lg ≥ 48 px),
`Card`, `PageHeader` (título, subtítulo y acción), `Field` (label, ayuda y error), `Input`, `Textarea` (con contador),
`Select`, `ChoiceCards` (selector tipo radio con tarjetas grandes e ícono opcional; es la base de los formularios de 3 toques),
`Likert` (1–5 con etiquetas en los extremos), `Chip` (tonos neutro, verde, amarillo, rojo), `Banner` (info, aviso, demo),
`EmptyState`, `StatCard` (título, valor, meta, línea base, estado y slot para una gráfica), `FormStatus` (aria-live),
`CopyButton` y `Countdown` (días restantes con color).
Crea `src/app/(app)/gestion/ui-demo/page.tsx` (solo gestion; ojo: las carpetas que empiezan con `_` no generan ruta) que muestre todos los componentes, como guía visual para los demás agentes.

## 5. Rutas y shell
- `(publico)/ingresar` (completo: login con código y mensajes de error amables), `(publico)/privacidad` (completo, SPEC §9).
- `(app)/layout.tsx`: encabezado, barra inferior móvil (SPEC §3), banner demo y modal de aviso de privacidad la primera vez.
- `(app)/inicio` (completo: el mosaico de SPEC §3; el contador de pendientes del buzón con una consulta directa a Prisma).
- `(app)/ayuda` (completo: compone `src/features/{mapa,semaforo,bitacora,buzon,pulso,circulos,tablero}/ayuda.ts`; crea esos
  archivos con un stub `export const ayuda = { titulo, pasos: [] }`).
- **Placeholders** para todas las demás rutas de CLAUDE.md, con `PageHeader` y un `EmptyState` «En construcción — agente <nombre>».
  Cada placeholder ya llama a `requireRole` con el rol correcto.
- `api/health/route.ts`: hace `SELECT 1` y responde `{ ok: true }`.
- PWA mínima: `app/manifest.ts` (nombre, colores e íconos simples generados en SVG o PNG), para que se pueda «Agregar a la
  pantalla de inicio».
- Encabezados de seguridad básicos en `next.config` (X-Frame-Options, Referrer-Policy, X-Content-Type-Options).

## 6. CI y despliegue
- `.github/workflows/ci.yml`: en cada push y PR, Node 22 → `npm ci` → lint → typecheck → test → build (con un `DATABASE_URL`
  ficticio; el build no debe conectarse a la BD, así que las páginas con datos deben ser dinámicas).
- Verifica que `render.yaml` sea coherente con los scripts (build: `npm ci && npx prisma generate && npx prisma migrate deploy &&
  npm run build && npm run db:seed`).
- `README.md`: qué es, el stack, cómo correrlo localmente, cómo se despliega y una sección «Arquitectura y privacidad por diseño»
  (es para el portafolio, así que escríbela bien).

## 7. Verificación y entrega
1. `npm run lint && npm run typecheck && npm test && npm run build` en verde.
2. `npm run dev` en segundo plano → `curl -sf http://localhost:3000/api/health`; probar el login con los códigos locales; abrir
   /inicio y verificar que cada placeholder responde. Detén el servidor al terminar.
3. Commit `feat: fundación de Pulso Renacer` y `git push origin main`.
4. Al final, imprime un resumen con: qué quedó, cómo verificarlo y las **instrucciones exactas para crear el Blueprint en Render**
   (Dashboard → New → Blueprint → repo → TEAM_CODE y ADMIN_CODE → Apply).
