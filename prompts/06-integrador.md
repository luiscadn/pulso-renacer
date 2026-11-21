# Fase 2 · INTEGRADOR (en `main`, en el repo principal)

Eres el integrador. Lee `CLAUDE.md` y `docs/SPEC.md`. Trabaja de forma autónoma.

## 1. Estado
`git fetch --all --prune` y `gh pr list --state open`. Deberían existir 5 PRs: `feat/mapa-semaforo`, `feat/bitacora`,
`feat/buzon`, `feat/pulso-circulos` y `feat/tablero`. Si falta alguno, reporta cuál y sigue con los demás.

## 2. Fusión en orden (de menor a mayor dependencia)
Orden: `feat/mapa-semaforo` → `feat/bitacora` → `feat/buzon` → `feat/pulso-circulos` → `feat/tablero`.
Para cada rama:
1. `git switch main && git pull` → `git merge --no-ff origin/<rama> -m "merge: <rama>"`.
2. Resuelve los conflictos respetando la propiedad de `CLAUDE.md`. En los archivos de un dueño, gana su versión. En los
   compartidos, combina las dos.
3. `npm ci && npm run lint && npm run typecheck && npm test && npm run build`. Si algo falla, corrígelo en un commit
   `fix(integracion): ...`.
4. `git push origin main`. GitHub marca el PR como fusionado. Si no, ciérralo con `gh pr close <n> --comment "Fusionado en main"`.

## 3. Cambios compartidos propuestos
Lee `notas/*.md`. Aplica los `CAMBIO-COMPARTIDO-PROPUESTO` que sean razonables (por ejemplo, un componente de `ui` que dos módulos
duplicaron → muévelo a `src/components/ui` y actualiza a ambos). Documenta en `notas/integracion.md` qué aplicaste y qué no.

## 4. Coherencia de producto
- Recorre todas las rutas como `equipo` y como `gestion` con `npm run dev` y `bash scripts/db-local.sh integracion` (datos demo
  completos). Verifica que no quede ningún placeholder «En construcción», que la navegación sea consistente, que los textos estén
  en un solo tono y que /ayuda esté completa.
- Verifica que **el tablero muestre todos los indicadores con datos demo** (ninguno debería quedar «insuficiente» salvo I7-p7 si
  aplica) y que los valores tengan sentido frente a la historia de SPEC §8.
- Verifica las reglas de privacidad con `grep`: que no se guarden iniciales de pacientes, que el CSV de sugerencias no tenga
  firma y que no haya `console.log` con datos.
- Push final a `main` → Render despliega solo. Si tienes el plugin o el MCP de Render, revisa el estado del deploy y los logs
  hasta que quede «live», y corrige si falla. Si no, explícame cómo verificarlo en el Dashboard.

## 5. Reporte
Imprime: los PRs fusionados, los conflictos resueltos, las correcciones, la URL pública si la conoces y la lista de pendientes.
