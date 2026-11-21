# Pulso Renacer

Web app interna de **Renacer Clínica y Spa** (Palmira, Colombia) para la estrategia de comunicación interna del curso
*Comunicación Interna y Cultura Organizacional* (Universidad Icesi). Muestra quién resuelve qué, estandariza los avisos de
agenda, registra las consultas, cierra el ciclo de las sugerencias, mide el clima con un pulso anónimo y calcula los
indicadores de la estrategia. La especificación completa está en [`docs/SPEC.md`](docs/SPEC.md).

## Stack
Next.js 16 (App Router, TypeScript strict) · Tailwind CSS 4 · Server Actions + zod · Prisma 6 + PostgreSQL 16 ·
sesión con cookie JWT firmada (`jose`) · `date-fns` + `@date-fns/tz` · recharts · vitest · Playwright · GitHub Actions ·
Render Blueprint (web) + Neon Postgres (base de datos).

## Correrlo localmente
```bash
npm install
docker compose up -d                 # Postgres 16 en el puerto 5432
bash scripts/db-local.sh dev         # crea renacer_dev, .env/.env.local, migra y siembra base + demo
npm run dev                          # http://localhost:3000
```
Códigos locales: equipo `2026`, gestión `renacer-gestion`. Verificación: `npm run lint && npm run typecheck && npm test && npm run build`.

## Despliegue (Render + Neon)
- **App pública:** https://pulso-renacer.onrender.com (salud: `/api/health`). QR de acceso: `public/qr-acceso.png`.
- **Arquitectura:** Next.js en Render (`render.yaml`) + Postgres en **Neon** (externo, us-east-1, plan free sin expiración).
- En cada push a `main`, Render ejecuta `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build && npm run db:seed`
  (la siembra es idempotente) y revisa `/api/health`.
- Pasos: Dashboard → **New → Blueprint** → elegir el repo → pegar `DATABASE_URL` (cadena de conexión de Neon, como variable
  secreta) → escribir `TEAM_CODE` y `ADMIN_CODE` → **Apply**.

## Pruebas E2E
`npm run e2e` (Playwright) recorre los dos roles en 390 × 844 contra `npm run build && npm run start` con la BD local.
Requiere `npx playwright install chromium` la primera vez. En CI es un job opcional y no bloqueante.

## Arquitectura y privacidad por diseño
- **Sin cuentas de usuario.** Se ingresa con un código compartido por rol (`equipo` o `gestion`). La sesión es una cookie
  `httpOnly` con un JWT HS256 de 30 días. `src/proxy.ts` protege todas las rutas y `/gestion/**` exige el rol de gestión; además
  cada página y cada Server Action vuelve a verificar el rol en el servidor (`requireRole`). Los códigos se comparan en tiempo
  constante y el login tiene un límite de 5 intentos cada 10 minutos, en memoria: la IP nunca se guarda.
- **Minimización de datos (Ley 1581 de 2012).** El modelo de datos no tiene columnas para nombres de pacientes o compañeras,
  correos, IPs ni user-agents. La bitácora guarda roles; el semáforo usa las iniciales solo para armar el mensaje; las
  sugerencias anónimas y el pulso guardan solo el día (`@db.Date`), sin hora, para que no se puedan cruzar con turnos.
- **Regla de anonimato.** Ningún promedio, porcentaje o desglose se muestra si n < `umbralAnonimato` (3 por defecto):
  `src/lib/privacidad.ts` ni siquiera calcula el valor en ese caso.
- **Honestidad con los datos.** Los datos de demostración llevan `esDemo=true`, se anuncian con un banner fijo y se pueden
  borrar desde Ajustes. Fuera del modo demo, `filtroDemo()` los excluye de todos los indicadores.
- **Zona horaria.** El servidor corre en UTC; toda la lógica de días y semanas usa `America/Bogota` (`src/lib/fechas.ts`,
  con pruebas del borde de medianoche).
- **Indicadores como funciones puras** (`src/features/tablero/metricas.ts`), probadas de forma aislada.
- **Cero costo extra.** Sin analytics, correo ni almacenamiento externo: todo vive en Next.js + Postgres.

## Estructura
```
src/app/(publico)      ingresar, privacidad
src/app/(app)          módulos del equipo y /gestion/**
src/features/<módulo>  acciones, consultas, componentes y ayuda de cada módulo
src/lib                db · auth · fechas · privacidad · labels · demo · validacion · ajustes
src/components/ui      design system (guía visual en /gestion/ui-demo)
prisma/                schema, migraciones y siembra (base + demo por módulo)
```
