# Pulso Renacer — memoria del proyecto (léela completa antes de tocar código)

## Qué es y por qué existe
Pulso Renacer es la web app interna de **Renacer Clínica y Spa** (Palmira, Colombia; menos de 10 personas: propietaria,
administradora, secretaria, recepción, terapeutas de planta y prestadoras por horas/sábados).

Hace parte de una estrategia de comunicación interna (curso de Comunicación Interna y Cultura Organizacional, Universidad Icesi).
El diagnóstico encontró que en Renacer:
- las dudas y los problemas terminan escalados a la propietaria (3 de 4 colaboradoras lo dicen),
- las sugerencias no reciben respuesta («sugerencias sin retorno»),
- la coordinación de la agenda entre recepción y cabinas genera desgaste,
- parte del equipo no se siente segura para expresar desacuerdos (3,25/5).

La app **no reemplaza** WhatsApp ni el sistema de agenda del spa. Su trabajo es:
1. Mostrar quién resuelve qué (mapa «¿A quién acudo?»).
2. Estandarizar los avisos de retraso (semáforo de agendas) y generar el mensaje para WhatsApp.
3. Registrar las consultas (bitácora) para medir si reciben respuesta y quién decide.
4. Cerrar el ciclo de las sugerencias (buzón «Propusiste / Hicimos» con un compromiso de respuesta en 15 días).
5. Medir el clima con un pulso semanal anónimo y registrar los círculos de bienestar y las mediaciones.
6. Calcular automáticamente los indicadores de la estrategia, con privacidad por diseño.

La especificación funcional completa está en `docs/SPEC.md`. Esa es la fuente de verdad.

## Principios no negociables
1. **Privacidad primero (Ley 1581 de 2012, habeas data).** No se guardan nombres de pacientes ni de compañeras, IPs, user-agents
   ni correos. Las sugerencias anónimas guardan solo la fecha (sin hora). Ningún promedio, porcentaje o desglose se muestra si su
   n < `umbralAnonimato` (3 por defecto). En ese caso se muestra «Datos insuficientes para proteger el anonimato».
2. **Español colombiano, cálido y claro**, con tuteo. Nada de jerga técnica en la interfaz.
3. **Mobile-first.** Se usa en el celular, de pie, entre citas. Los botones táctiles miden al menos 44 px y registrar algo
   toma 3 toques o menos cuando sea posible.
4. **Zona horaria America/Bogota** para toda la lógica de días y semanas (Render corre en UTC). Usa siempre `src/lib/fechas.ts`.
5. **Honestidad con los datos.** Si `DEMO_MODE=true` se muestra un banner fijo «Datos de demostración». Los datos demo se marcan con
   `esDemo=true` y se pueden borrar desde Ajustes.
6. **Cero costo extra.** No agregues servicios externos (analytics, correo, storage). Next.js en Render + Postgres en Neon (externo, `DATABASE_URL` como variable secreta en Render).

## Stack (fijo)
- Next.js (App Router, TypeScript strict, `src/`), Tailwind CSS, Server Actions con validación en `zod`.
- Prisma **6.x** (`prisma@6`, `@prisma/client@6`) + PostgreSQL 16.
- Sesión: cookie httpOnly firmada con `jose` (HS256), con roles `equipo` y `gestion`. No hay cuentas de usuario:
  se ingresa con `TEAM_CODE` o `ADMIN_CODE`.
- Fechas: `date-fns` + `@date-fns/tz`. Gráficas: `recharts`. QR: `qrcode`. Íconos: `lucide-react`.
- Pruebas: `vitest`. CI: GitHub Actions. Deploy: Render Blueprint (`render.yaml`).

## Comandos
```bash
docker compose up -d                 # Postgres local (puerto 5432)
bash scripts/db-local.sh <nombre>    # crea BD renacer_<nombre>, escribe .env.local, migra y siembra base + demo
npm run dev | build | start | lint | typecheck | test
npm run db:migrate                   # prisma migrate dev
npm run db:seed                      # contenido base (mapa, ajustes)
npm run db:seed:demo                 # contenido base + datos demo
```

## Estructura y propiedad (para trabajar en paralelo sin conflictos)
```
src/app/(publico)/ingresar, privacidad
src/app/(app)/inicio, acudo, semaforo, bitacora, buzon, muro, pulso, circulos, ayuda
src/app/(app)/gestion/mapa, buzon, pulso-roles, circulos, tablero, tablero/imprimir, exportar, ajustes
src/features/<modulo>/   actions.ts · queries.ts · components/ · ayuda.ts · *.test.ts
src/lib/                 db · auth · fechas · privacidad · labels · demo · validacion   (COMPARTIDO)
src/components/ui/       design system                                               (COMPARTIDO)
prisma/seed/demo/<modulo>.ts   datos demo de cada módulo
```

| Agente | Rama | Puede editar SOLO |
|---|---|---|
| mapa-semaforo | `feat/mapa-semaforo` | `src/features/mapa/**`, `src/features/semaforo/**`, rutas `acudo`, `semaforo`, `gestion/mapa`, `prisma/seed/demo/semaforo.ts` |
| bitacora | `feat/bitacora` | `src/features/bitacora/**`, ruta `bitacora`, `prisma/seed/demo/bitacora.ts` |
| buzon | `feat/buzon` | `src/features/buzon/**`, rutas `buzon`, `muro`, `gestion/buzon`, `prisma/seed/demo/buzon.ts` |
| pulso-circulos | `feat/pulso-circulos` | `src/features/pulso/**`, `src/features/circulos/**`, rutas `pulso`, `circulos`, `gestion/pulso-roles`, `gestion/circulos`, `prisma/seed/demo/pulso.ts`, `prisma/seed/demo/circulos.ts` |
| tablero | `feat/tablero` | `src/features/tablero/**`, `src/features/ajustes/**`, rutas `gestion/tablero/**`, `gestion/exportar`, `gestion/ajustes` |

**Archivos congelados en la fase 1** (solo los toca la fundación o el integrador): `prisma/schema.prisma`, `prisma/migrations/**`,
`src/lib/**`, `src/components/ui/**`, los `layout.tsx`, `src/middleware.ts` o `src/proxy.ts`, `src/app/(app)/inicio/**`, `src/app/(app)/gestion/ui-demo/**`, `src/app/(app)/ayuda/**`, `package.json`,
`package-lock.json`, `render.yaml`, `.github/**`, `CLAUDE.md`, `docs/SPEC.md`.
Si necesitas un cambio compartido: NO lo hagas. Resuélvelo dentro de tu carpeta (por ejemplo, con un componente propio) y anota la
propuesta en `notas/<agente>.md` con el título `CAMBIO-COMPARTIDO-PROPUESTO` para que el integrador decida.
No agregues dependencias en la fase 1: las necesarias ya vienen instaladas.

## Convenciones
- Las mutaciones se hacen con Server Actions en `features/<m>/actions.ts`: validar con zod → `requireRole()` → Prisma →
  `revalidatePath`. Nunca confíes en el cliente para el rol.
- Las etiquetas visibles de los enums salen de `src/lib/labels.ts`. Nunca muestres `PRODUCTO_PROMOCION` crudo.
- Las lecturas que alimentan indicadores respetan `filtroDemo()` de `src/lib/demo.ts`.
- Los componentes son servidor por defecto; usa `"use client"` solo para interacción.
- Cada formulario muestra estados de carga, error y éxito, y es accesible (label, foco visible, aria-live para los mensajes).
- Los textos de ayuda de cada módulo van en `features/<m>/ayuda.ts` (la página /ayuda los compone).

## Definición de terminado (cada agente, antes de su último commit)
1. `npm run lint && npm run typecheck && npm test && npm run build` sin errores.
2. Probado en `npm run dev` contra su BD local (`bash scripts/db-local.sh <modulo>`), en un viewport de 390 px.
3. Tiene al menos las pruebas unitarias que pide su prompt.
4. Datos demo del módulo implementados en `prisma/seed/demo/<modulo>.ts` (con `esDemo: true`).
5. `features/<m>/ayuda.ts` completo (instrucciones de uso en lenguaje simple).
6. Commits pequeños con mensajes convencionales en español (`feat(buzon): ...`), push de la rama y PR con `gh pr create --base main`
   que incluya qué se hizo, cómo probarlo y las decisiones tomadas.
