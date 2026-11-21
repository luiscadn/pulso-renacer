# Reglas comunes para los agentes de la fase 1 (léelas antes que tu prompt de módulo)

1. Lee completos `CLAUDE.md` y `docs/SPEC.md`. Revisa `src/lib/**`, `src/components/ui/**` y la página `/gestion/ui-demo` para reutilizar
   lo que ya existe. **No reimplementes lo que ya está en `lib` o `ui`.**
2. **Git:** el script de lanzamiento ya te dejó en tu worktree (`.claude/worktrees/<modulo>`) y en tu rama. Compruébalo con
   `git rev-parse --show-toplevel && git branch --show-current`. Si no estás en la rama de tu fila de `CLAUDE.md`, cámbiate con
   `git switch <tu-rama>` (o `git switch -c <tu-rama>`). Nunca hagas commit en `main` ni push a `main`.
3. **Base de datos local:** `bash scripts/db-local.sh <tu-modulo>` (crea tu propia BD, migra y siembra). En tu worktree corre
   `npm ci` primero. Si el puerto 3000 está ocupado por otro agente, usa `PORT=30xx npm run dev` con el número de puerto de tu
   prompt.
4. Edita **solo** los archivos de tu fila en la tabla de propiedad de `CLAUDE.md`. Los cambios compartidos van como propuesta en
   `notas/<tu-modulo>.md`.
5. No cambies el schema. Si de verdad falta un campo, documéntalo en `notas/<tu-modulo>.md` y busca una solución sin él.
6. Calidad de producto real: textos en español claro, estados vacíos con una invitación a actuar, carga, error y éxito, foco
   visible, y prueba en 390 px. Usa **subagentes** para revisar tu propio trabajo (por ejemplo, uno que haga QA de accesibilidad y
   textos mientras tú terminas la lógica).
7. Cumple la **Definición de terminado** de `CLAUDE.md` (lint, typecheck, test, build, demo, ayuda).
8. Al terminar: `git push -u origin <tu-rama>` y
   `gh pr create --base main --title "<tipo>(<modulo>): <resumen>" --body "<qué, cómo probar, decisiones, notas para el integrador>"`.
9. Trabaja de forma autónoma de principio a fin. Si algo es ambiguo, toma la decisión más coherente con SPEC y CLAUDE.md y
   regístrala en el cuerpo del PR.
