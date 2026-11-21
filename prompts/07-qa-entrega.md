# Fase 3 · QA, pulido y material de entrega (en `main`)

Lee `CLAUDE.md` y `docs/SPEC.md`. Trabaja de forma autónoma y usa subagentes en paralelo para las tareas independientes
(A, B y C pueden ir en paralelo; D va al final).

## A. QA funcional y de experiencia
1. `npm i -D @playwright/test && npx playwright install chromium`. Puedes agregar esta dependencia en esta fase.
2. `e2e/recorrido.spec.ts` contra `npm run build && npm start` con la BD local de integración, en un viewport de 390×844:
   login como equipo → abrir una consulta en 3 toques → cerrarla → enviar un aviso de semáforo → proponer una mejora → responder
   el pulso. Login como gestión → responder y publicar la propuesta → verla en el muro → registrar un acta → abrir el tablero y
   comprobar que cambió → descargar un CSV.
3. Toma capturas de cada pantalla principal en móvil y escritorio y guárdalas en `docs/capturas/` (sirven para el portafolio y
   el informe).
4. Corrige todo lo que encuentres: textos, foco, contraste, estados vacíos, errores en consola y layouts rotos en 360 px.
5. Agrega `npm run e2e` y súmalo al CI como job opcional (no bloqueante).

## B. Documentos de entrega (en `docs/entrega/`)
1. `MANUAL-DE-USO.md`: instrucciones de uso por módulo (para el equipo y para gestión), con capturas, más una «Guía de 5 minutos
   para empezar» y preguntas frecuentes. Es el instructivo que exige el portafolio de productos.
2. `FICHA-TECNICA.md`: arquitectura (diagrama Mermaid), stack, modelo de datos, privacidad por diseño (los umbrales, lo que no se
   guarda, la Ley 1581), costos en Render (piloto gratis: la BD gratis expira a los 30 días; producción: web starter US$7/mes +
   Postgres basic-256mb US$6/mes + almacenamiento), un plan de sostenibilidad (quién administra, cómo se cambian los códigos,
   cómo se exportan los datos, la salida digna: CSV → Google Sheets) y los riesgos técnicos con su mitigación.
3. `INDICADORES.md`: una tabla I1–I16 con el objetivo, la táctica, la fórmula, la fuente en la app, la meta y la frecuencia, para
   que el informe la use tal cual.
4. `CASO-PORTAFOLIO.md`: un case study en primera persona (Luis Felipe Cadena, Ingeniería de Sistemas, Icesi) con el problema, el
   enfoque, las decisiones de arquitectura, la privacidad, los resultados del piloto (dejar placeholders) y los aprendizajes.
   Máximo una página y media.

## C. Material para la sustentación
- `public/qr-acceso.png`: un QR hacia la URL pública (pregúntame la URL si no la encuentras en `RENDER_EXTERNAL_URL` ni en el
  deploy) y `docs/entrega/qr-acceso.png`.
- `docs/entrega/GUION-DEMO.md`: un guion de demo en vivo de 2 minutos (qué tocar y en qué orden, con un plan B si el servicio
  gratis tarda en despertar: abrirlo 5 minutos antes).

## D. Cierre
`npm run lint && npm run typecheck && npm test && npm run build` en verde → commit → push a `main` → verificar el deploy en
Render → imprimir un resumen con la URL, los archivos generados y los pendientes.
