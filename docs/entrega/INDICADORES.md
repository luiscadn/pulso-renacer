# Indicadores I1–I16 · Pulso Renacer

Tabla para el informe. Las fórmulas son las de [`docs/SPEC.md`](../SPEC.md) §6.8 y se calculan en `src/features/tablero/metricas.ts`,
con funciones puras y pruebas unitarias para cada indicador. Todas las lecturas excluyen los datos de demostración.

**Convenciones**

- **P** = periodo elegido en el tablero (14 días por defecto, 30 días o rango). **B** = línea base (`Ajuste.lineaBaseInicio` a `lineaBaseFin`).
- **Regla de anonimato:** si el denominador `n` es menor que `umbralAnonimato` (3 por defecto), el tablero muestra «Datos insuficientes (n < 3)» en lugar del valor.
- **Frecuencia:** la especificación no la fija. La propuesta es **cada 14 días**, al cierre de cada periodo, y una lectura final al cerrar el piloto. Confirmar con la administración.

| Id | Objetivo | Táctica | Fórmula | Fuente en la app | Meta | Frecuencia (propuesta) |
|---|---|---|---|---|---|---|
| **I1** | O1 · Escalamiento | A1 · uso del mapa | % de consultas en P con `dirigidaA = PROPIETARIA` | Tablero · tarjeta I1 (`/gestion/tablero`) | ≤ 50 % del valor en B | Quincenal |
| **I2** | O1 · Respuesta | Respuesta | Consultas cerradas con `recibioRespuesta = true` ÷ consultas en P. Excluye las abiertas de menos de 24 h; las abiertas de más de 24 h cuentan como sin respuesta | Tablero · I2 | ≥ 90 % | Quincenal |
| **I3** | O1 · Respuesta | Respuesta | % con `tiempoRespuesta` en {MISMO_DIA, MENOS_24H}; mismo denominador que I2 | Tablero · I3 | ≥ 80 % | Quincenal |
| **I4** | O1 · Decisión | Decisión | % de las consultas cerradas con `decidio = ROL_DELEGADO` | Tablero · I4 | Mayor que en B | Quincenal |
| **I5** | O1 · Decisión | Decisión | De las decididas por un rol delegado, % con `revertida = false` | Tablero · I5 | ≥ 90 % | Quincenal |
| **I6** | O1 · Escalamiento | Escalamiento | % de consultas en P con `escalada = true` (con desglose por motivo) | Tablero · I6 | ≤ 25 % | Quincenal |
| **I7** | O1 · Percepción | Percepción | Promedio de p6 (pulso) · promedio de p7 (roles) | Tablero · I7 · Pulso y pulso de roles | ≥ 4,2 · ≥ 4,0 | Quincenal |
| **I8** | O2 · Información | A2 / A3 · información diaria | Promedio de p3 y número de respuestas con p3 ≤ 3 | Tablero · I8 | ≥ 4,5 y 0 respuestas ≤ 3 | Quincenal |
| **I9** | O2 · Información | Información | Consultas de tipo `PRODUCTO_PROMOCION` en P frente a B | Tablero · I9 | Reducción frente a B | Quincenal |
| **I10** | O2 · Kit de cabina | A3 · kit de cabina | `kitCabinasActualizadas` ÷ `kitCabinasTotal` (Ajustes) | Tablero · I10 · Ajustes | 100 % | Quincenal |
| **I11** | O3 · Comunicación | A4 · semáforo | Promedio de p4 | Tablero · I11 | ≥ 4,2 | Quincenal |
| **I12** | O3 · Comunicación | A4 · semáforo | % de `AvisoAgenda` en P con `minutosAnticipacion ≥ 15` | Tablero · I12 · Semáforo | ≥ 80 % | Quincenal |
| **I13** | O3 · Escucha | B1 / B2 · escucha | Promedio de p5 y número de respuestas con p5 ≤ 2 | Tablero · I13 | ≥ 4,2 y 0 respuestas ≤ 2 | Quincenal |
| **I14** | O3 · Mediación | B2 · mediación | Mediaciones con `ACUERDO` y `seguimientoHecho` ÷ mediaciones distintas de `EN_CURSO` | Tablero · I14 · Círculos | ≥ 80 % | Por mediación |
| **I15** | O3 · Círculos | B1 · círculos | Actas registradas desde `lineaBaseInicio` ÷ `metaCirculos` | Tablero · I15 · Círculos | 6 de 6 | Quincenal |
| **I16** | O3 · Buzón | B3 · buzón | Sugerencias respondidas en 15 días o menos ÷ sugerencias cuyo plazo ya venció o que ya fueron respondidas | Tablero · I16 · Bandeja del buzón | 100 % | Quincenal |

## Notas para el informe

- **Pulso (I7, I8, I11, I13):** son promedios de la escala 1–5 de una afirmación. Con menos de 3 respuestas no se muestran.
- **I14 y I16** tienen denominadores que pueden ser 0; en ese caso el tablero muestra «Datos insuficientes», no un 0 %.
- **Línea base (B):** son las fechas `lineaBaseInicio` y `lineaBaseFin` de Ajustes (por defecto, hoy y 13 días después). Conviene fijarlas con la administración antes de iniciar el piloto y no moverlas después.
- **Datos de demostración:** `DEMO_MODE=true` marca los datos con `esDemo`. Para el informe real, usar la BD sin datos demo.
