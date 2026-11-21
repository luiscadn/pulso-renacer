# Fase 1 · Agente TABLERO — rama `feat/tablero` — puerto 3005

Primero lee y aplica `prompts/_comun-fase1.md`.

## Objetivo
El cerebro de evaluación de la estrategia: los indicadores I1–I16 de SPEC §6.8, calculados automáticamente con **privacidad por
diseño**, más la exportación y los ajustes (SPEC §6.7). Es la pieza que más se luce técnicamente en el portafolio: debe ser
correcta, estar probada y explicarse sola.

## Arquitectura obligatoria
- `src/features/tablero/metricas.ts`: **funciones puras**, sin Prisma. Reciben filas tipadas y `{ periodo, lineaBase, hoy,
  umbral, ajustes }` y devuelven `Indicador = { id, objetivo, tactica, titulo, valor: number | null, valorBase: number | null,
  meta: string, n: number, estado: 'cumple' | 'en_camino' | 'no_cumple' | 'insuficiente', formato: 'porcentaje' | 'promedio' |
  'conteo' | 'fraccion', detalle?: ... }`. «En camino» significa que mejora frente a la línea base pero todavía no alcanza la meta.
- `src/features/tablero/metricas.test.ts`: **por lo menos una prueba por indicador**, más los bordes: n < umbral → insuficiente;
  denominador 0; abiertas de menos de 24 h excluidas y de más de 24 h contadas como sin respuesta (I2, I3); I5 solo sobre las que
  decidió un rol delegado; I16 con el plazo del día 15 exacto; I1 comparado contra la línea base («≤ 50 % del valor base»). Usa
  fixtures construidos a mano.
- `src/features/tablero/queries.ts`: trae las filas con `filtroDemo()` para P y B (solo las columnas necesarias) y llama a
  `metricas`.
- `tendenciaSemanal(filas, indicador)` para las mini gráficas de I1, I2 e I12 (`recharts`, en un componente cliente pequeño).

## Pantallas
- `(app)/gestion/tablero`: selector de periodo (14 días · 30 días · rango) en la URL (searchParams). Tres secciones (O1
  «Conducto regular efectivo», O2 «Información operativa», O3 «Sincronía, escucha y mediación») con `StatCard`. Cada tarjeta
  muestra el valor, la línea base, la meta, el chip de estado, n y un tooltip o detalle «¿Cómo se calcula?» con la fórmula en
  español. Arriba, un resumen: «X de 16 indicadores cumplen · Y en camino». Botones «Imprimir / PDF» y «Exportar».
  Nota fija: «Ningún dato se muestra si viene de menos de 3 registros, para proteger el anonimato».
- `(app)/gestion/tablero/imprimir`: la misma información en una tabla limpia para imprimir (CSS `@media print`), con fecha, periodo,
  línea base y la leyenda de la regla de anonimato. Es el anexo del informe.
- `(app)/gestion/exportar`: botones de CSV por tabla (Consulta, Sugerencia **sin firma**, AvisoAgenda, RespuestaPulso,
  RespuestaPulsoRoles, ActaCirculo, Mediacion) a través de route handlers bajo `(app)/gestion/exportar/[tabla]/route.ts`, que
  validan el rol `gestion`. UTF-8 con BOM y cabeceras en español. También un CSV «indicadores» con lo que muestra el tablero.
- `(app)/gestion/ajustes` (`src/features/ajustes/`): un formulario para las claves de `Ajuste` (SPEC §5), con validación (fechas
  ISO, umbral ≥ 3, meta ≥ 1). Si `esModoDemo()`: «Cargar datos de demostración» y «Borrar datos de demostración», con
  confirmación, usando `src/lib/demo-seed.ts`.
- Un **QR** en Ajustes: «Compartir acceso al equipo», generado con `qrcode` a partir de la URL pública
  (`process.env.RENDER_EXTERNAL_URL` o el host de la solicitud), con un botón para descargarlo en PNG.
- `src/features/tablero/ayuda.ts`: cómo leer el tablero, qué significa cada estado y la regla de anonimato.

## Calidad
Con los datos demo de los demás módulos (aunque en tu rama sean stubs), tus pruebas deben pasar con fixtures propios. Para ver la
UI con datos, crea un script temporal `notas/tmp-tablero-datos.ts` (ejecútalo con `npx tsx`) que inserte filas de ejemplo en tu
BD local con `esDemo: true`, y **bórralo antes de abrir el PR**.
