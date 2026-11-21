# Notas de la fundación
- Next 16.4: se usa `src/proxy.ts` (no middleware). `cacheComponents` quedó desactivado a propósito (render por petición).
- `@types/node@22` (vitest 5 no acepta @types/node 20).
- `LayoutProps`/`PageProps` globales no se usan porque `tsc` corre antes de `next build` en CI; tipa props a mano.
- `accion(esquema, fn)` en `src/lib/validacion.ts` sirve directo o con `useActionState`. Lanza `ErrorAmable` para mensajes propios.
- `requireRole('equipo')` también deja pasar a gestión.
- Columnas `@db.Date`: usar `soloFecha()` para escribir y `formatoCorto(d, { soloFecha: true })` para mostrar.
- Scripts de lanzamiento: modelo por defecto `sonnet` (QA con `haiku`); se cambia con `MODELO=...`.
