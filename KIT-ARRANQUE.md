# Kit de arranque — Pulso Renacer (hoy, de cero a desplegado)

**Qué vas a tener al final del día:** una web app real en Render, con login por código, el mapa «¿A quién acudo?», el semáforo
de agendas, la bitácora, el buzón «Propusiste / Hicimos», el pulso semanal, los círculos y mediaciones, y un tablero con 16
indicadores calculados solos. Además: el manual de uso, la ficha técnica, capturas, un QR y el guion de la demo.

```
Fase 0  fundación ─────────►  Fase 1  (5 agentes en paralelo, cada uno en su worktree)  ─────►  Fase 2 integrador ─► Fase 3 QA + entrega
1 agente, ~40 min             mapa-semaforo · bitacora · buzon · pulso-circulos · tablero        ~30 min               ~40 min
                              ~60–90 min (tú haces las piezas análogas mientras tanto)
```

## 0. Requisitos (2 min)
```bash
node -v          # 20 o más (ideal 22)
gh auth status   # GitHub CLI con sesión iniciada
docker info      # Docker Desktop abierto
claude --version # Claude Code actualizado (claude update)
```
Plugin de Render en Claude Code, para que los agentes vean los deploys y los logs. Escríbelo **dentro** de una sesión `claude`:
```
/plugin marketplace add render-oss/render-plugin-claude-code
/plugin install render
```

## 1. Fase 0 — Fundación
```bash
unzip pulso-renacer-kit.zip -d ~/proyectos && cd ~/proyectos/pulso-renacer
# (opcional) pon la paleta real de Renacer en docs/SPEC.md §4 antes de arrancar
bash scripts/00-arrancar.sh            # crea el repo privado en GitHub, levanta Postgres y lanza el agente de fundación
```
El agente termina con push a `main`. **Revisa rápido** con `npm run dev` → http://localhost:3000 (código de equipo `2026`, de
gestión `renacer-gestion`).

### Desplegar en Render (único paso manual, 3 min)
1. Dashboard de Render → **New → Blueprint** → elige el repo `pulso-renacer` (si no aparece, dale acceso a la GitHub App de
   Render a ese repo).
2. Te pide `TEAM_CODE` y `ADMIN_CODE`: usa códigos reales (por ejemplo, equipo `4729`, gestión `renacer-admin-2026`).
3. **Apply.** Desde ahí, cada push a `main` despliega solo.

## 2. Fase 1 — Cinco agentes en paralelo
```bash
bash scripts/01-lanzar-agentes.sh                     # usa acceptEdits + la allowlist de .claude/settings.json
# alternativas:
MODO=auto bash scripts/01-lanzar-agentes.sh           # aprobaciones automáticas por clasificador (si tu plan lo tiene)
MODELO=sonnet bash scripts/01-lanzar-agentes.sh       # si quieres cuidar tu límite de uso
SOLO="05-tablero" bash scripts/01-lanzar-agentes.sh   # relanzar solo uno
```
Monitoreo:
```bash
claude agents              # vista de todos los agentes
claude logs tablero        # salida reciente de uno
claude attach buzon        # entrar a uno (por ejemplo, para aprobar un permiso)
gh pr list                 # ver los PRs a medida que llegan
```
> ⚠️ Cinco agentes a la vez consumen tu límite de uso rápido. Si te acercas al tope, lanza 3 primero
> (`SOLO="01-mapa-semaforo 02-bitacora 05-tablero"`) y luego los otros 2.

**Plan B sin modo background** (una pestaña de terminal por agente):
```bash
claude -w mapa-semaforo   # y pega: "Lee prompts/_comun-fase1.md y ejecuta prompts/01-mapa-semaforo.md"
```

**Mientras trabajan, tú haces las piezas análogas** (el kit de cabina y el mapa impreso), usando el contenido de `docs/SPEC.md §7`.

## 3. Fase 2 — Integración y despliegue
Cuando `gh pr list` muestre los 5 PRs:
```bash
bash scripts/02-integrar.sh
```

## 4. Fase 3 — QA y material de entrega
```bash
bash scripts/03-qa-entrega.sh
```
Genera `docs/entrega/` (MANUAL-DE-USO, FICHA-TECNICA, INDICADORES, CASO-PORTAFOLIO, GUION-DEMO y el QR) y `docs/capturas/`.
Pásale a Melannie `INDICADORES.md`, `FICHA-TECNICA.md` (costos) y las capturas para el informe.

## 5. Limpieza
```bash
git worktree list
for d in .claude/worktrees/*; do git worktree remove "$d"; done
git branch -d feat/mapa-semaforo feat/bitacora feat/buzon feat/pulso-circulos feat/tablero
```

## Costos reales (para el presupuesto)
| Escenario | Web | Base de datos | Total |
|---|---|---|---|
| Entrega y piloto | Free (se duerme tras inactividad y tarda en despertar) | Free (**expira a los 30 días**) | US$0 |
| Producción | Starter US$7/mes | Basic-256mb US$6/mes + US$0,30/GB | ≈ US$13–14/mes |

Truco para la demo: abre la URL 5 minutos antes de la sustentación para que el servicio gratis despierte.

## Si algo falla
- **Un agente se queda quieto** → `claude attach <nombre>`: casi siempre está esperando un permiso que no está en la allowlist.
- **Puerto 5432 ocupado** → tienes otro Postgres local: `brew services stop postgresql` o cambia el puerto en `docker-compose.yml`
  y en `scripts/db-local.sh`.
- **Falla el build en Render** → en una sesión `claude` en el repo: «revisa los logs del último deploy fallido de pulso-renacer
  en Render y arréglalo» (con el plugin de Render).
