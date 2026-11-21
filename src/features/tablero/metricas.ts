/**
 * Indicadores I1–I16 (SPEC §6.8). Funciones PURAS: sin Prisma, sin reloj propio, sin acceso a la red.
 * Reciben filas tipadas y un contexto `{ periodo, lineaBase, hoy, umbral, ajustes }`.
 *
 * Convenciones:
 *  - Los porcentajes se expresan de 0 a 100; los promedios, de 1 a 5.
 *  - Privacidad por diseño: si el denominador (n) es menor que `umbral`, el valor NO se calcula
 *    (queda en `null`) y el estado es «insuficiente». Lo mismo vale para el valor de la línea base.
 *  - «En camino» = mejora frente a la línea base pero todavía no alcanza la meta.
 *  - Los días se leen en America/Bogota (ver `src/lib/fechas.ts`).
 */
import type {
  Decisor,
  Destinatario,
  MotivoEscalamiento,
  ResultadoMediacion,
  TiempoRespuesta,
  TipoSituacion,
} from "@prisma/client";
import { MOTIVO_ESCALAMIENTO } from "@/lib/labels";
import { claveDeSoloFecha, claveDia, fechaLimiteSugerencia, horasEntre, semanaISO } from "@/lib/fechas";

// ───────────────────────── Tipos ─────────────────────────

export type EstadoIndicador = "cumple" | "en_camino" | "no_cumple" | "insuficiente";
export type FormatoIndicador = "porcentaje" | "promedio" | "conteo" | "fraccion";
export type IdIndicador =
  | "I1" | "I2" | "I3" | "I4" | "I5" | "I6" | "I7" | "I8"
  | "I9" | "I10" | "I11" | "I12" | "I13" | "I14" | "I15" | "I16";

export type DetalleIndicador = {
  etiqueta: string;
  /** null = oculto por la regla de anonimato */
  valor: number | null;
  formato: FormatoIndicador;
  n?: number;
};

export type Indicador = {
  id: IdIndicador;
  objetivo: "O1" | "O2" | "O3";
  tactica: string;
  titulo: string;
  /** Valor en el periodo P. null si no hay datos suficientes. En formato «fraccion» es el numerador. */
  valor: number | null;
  /** Valor en la línea base B (null si no aplica o no hay datos suficientes). */
  valorBase: number | null;
  /** Solo en formato «fraccion»: el denominador (por ejemplo, 4 cabinas o 6 círculos). */
  total?: number;
  meta: string;
  /** Tamaño de la muestra (denominador) en P. */
  n: number;
  estado: EstadoIndicador;
  formato: FormatoIndicador;
  /** Fórmula en español, para el «¿Cómo se calcula?». */
  formula: string;
  detalle?: DetalleIndicador[];
};

/** Rango de días de Bogotá, inclusivo, como 'YYYY-MM-DD'. */
export type Rango = { desde: string; hasta: string };

export type ConsultaFila = {
  abiertaEn: Date;
  cerradaEn: Date | null;
  tipo: TipoSituacion;
  dirigidaA: Destinatario;
  recibioRespuesta: boolean | null;
  tiempoRespuesta: TiempoRespuesta | null;
  decidio: Decisor | null;
  escalada: boolean;
  motivoEscalamiento: MotivoEscalamiento | null;
  revertida: boolean;
};
/** `fecha` y `respondidaEn` son columnas @db.Date (medianoche UTC). */
export type SugerenciaFila = { fecha: Date; respondidaEn: Date | null };
export type AvisoFila = { creadoEn: Date; minutosAnticipacion: number };
export type PulsoFila = { fecha: Date; p1: number; p2: number; p3: number; p4: number; p5: number; p6: number };
export type PulsoRolesFila = { fecha: Date; p7: number };
export type ActaFila = { fecha: Date };
export type MediacionFila = { fecha: Date; resultado: ResultadoMediacion; seguimientoHecho: boolean };

export type Filas = {
  consultas: ConsultaFila[];
  sugerencias: SugerenciaFila[];
  avisos: AvisoFila[];
  pulsos: PulsoFila[];
  pulsosRoles: PulsoRolesFila[];
  actas: ActaFila[];
  mediaciones: MediacionFila[];
};

export type Contexto = {
  periodo: Rango;
  lineaBase: Rango;
  /** Instante actual (se inyecta para poder probar). */
  hoy: Date;
  umbral: number;
  ajustes: { metaCirculos: number; kitCabinasActualizadas: number; kitCabinasTotal: number; lineaBaseInicio: string };
};

export const FILAS_VACIAS: Filas = {
  consultas: [], sugerencias: [], avisos: [], pulsos: [], pulsosRoles: [], actas: [], mediaciones: [],
};

// ───────────────────────── Utilidades ─────────────────────────

const HORAS_SIN_RESPUESTA = 24;

const enRangoClave = (clave: string, r: Rango) => clave >= r.desde && clave <= r.hasta;
const porInstante = <T>(filas: T[], campo: (f: T) => Date, r: Rango) => filas.filter((f) => enRangoClave(claveDia(campo(f)), r));
const porSoloFecha = <T>(filas: T[], campo: (f: T) => Date, r: Rango) =>
  filas.filter((f) => enRangoClave(claveDeSoloFecha(campo(f)), r));

const pct = (num: number, den: number) => (den === 0 ? null : (num / den) * 100);
const promedio = (xs: number[]) => (xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length);

/** Resultado crudo de una fórmula sobre un conjunto de filas. */
type Calculo = { valor: number | null; n: number; detalle?: DetalleIndicador[] };

/** Aplica la regla de anonimato: con n < umbral no se entrega el valor. */
function proteger(c: Calculo, umbral: number): Calculo {
  if (c.n < umbral || c.valor === null) return { valor: null, n: c.n, detalle: c.detalle?.map((d) => ({ ...d, valor: null })) };
  return c;
}

// ───────────────────────── Fórmulas por indicador ─────────────────────────
// Cada una recibe SOLO las filas del rango y devuelve valor y n sin proteger.

/** Consultas que entran al denominador de I2/I3: excluye las abiertas hace menos de 24 h. */
export function consultasEvaluables(consultas: ConsultaFila[], hoy: Date): ConsultaFila[] {
  return consultas.filter((c) => c.cerradaEn !== null || horasEntre(c.abiertaEn, hoy) >= HORAS_SIN_RESPUESTA);
}

const f = {
  i1: (cs: ConsultaFila[]): Calculo => ({
    valor: pct(cs.filter((c) => c.dirigidaA === "PROPIETARIA").length, cs.length),
    n: cs.length,
  }),
  i2: (cs: ConsultaFila[], hoy: Date): Calculo => {
    const ev = consultasEvaluables(cs, hoy);
    return { valor: pct(ev.filter((c) => c.cerradaEn !== null && c.recibioRespuesta === true).length, ev.length), n: ev.length };
  },
  i3: (cs: ConsultaFila[], hoy: Date): Calculo => {
    const ev = consultasEvaluables(cs, hoy);
    const rapidas = ev.filter((c) => c.tiempoRespuesta === "MISMO_DIA" || c.tiempoRespuesta === "MENOS_24H");
    return { valor: pct(rapidas.length, ev.length), n: ev.length };
  },
  i4: (cs: ConsultaFila[]): Calculo => {
    const cerradas = cs.filter((c) => c.cerradaEn !== null && c.decidio !== null);
    return { valor: pct(cerradas.filter((c) => c.decidio === "ROL_DELEGADO").length, cerradas.length), n: cerradas.length };
  },
  i5: (cs: ConsultaFila[]): Calculo => {
    const delegadas = cs.filter((c) => c.cerradaEn !== null && c.decidio === "ROL_DELEGADO");
    return { valor: pct(delegadas.filter((c) => !c.revertida).length, delegadas.length), n: delegadas.length };
  },
  i6: (cs: ConsultaFila[]): Calculo => {
    const escaladas = cs.filter((c) => c.escalada);
    const motivos: MotivoEscalamiento[] = ["NO_CORRESPONDIA", "ROL_PREFIRIO_NO_DECIDIR", "PIDIO_HABLAR_CON_DUENA", "OTRO"];
    return {
      valor: pct(escaladas.length, cs.length),
      n: cs.length,
      detalle: motivos.map((m) => ({
        etiqueta: MOTIVO_ESCALAMIENTO[m],
        valor: escaladas.filter((c) => c.motivoEscalamiento === m).length,
        formato: "conteo" as const,
      })),
    };
  },
  i9: (cs: ConsultaFila[]): Calculo => ({
    valor: pct(cs.filter((c) => c.tipo === "PRODUCTO_PROMOCION").length, cs.length),
    n: cs.length,
  }),
  promedioPulso: (ps: PulsoFila[], p: "p3" | "p4" | "p5" | "p6"): Calculo => ({ valor: promedio(ps.map((x) => x[p])), n: ps.length }),
  p7: (rs: PulsoRolesFila[]): Calculo => ({ valor: promedio(rs.map((x) => x.p7)), n: rs.length }),
  i12: (as: AvisoFila[]): Calculo => ({
    valor: pct(as.filter((a) => a.minutosAnticipacion >= 15).length, as.length),
    n: as.length,
  }),
  i14: (ms: MediacionFila[]): Calculo => {
    const cerradas = ms.filter((m) => m.resultado !== "EN_CURSO");
    return {
      valor: pct(cerradas.filter((m) => m.resultado === "ACUERDO" && m.seguimientoHecho).length, cerradas.length),
      n: cerradas.length,
    };
  },
  /** Plazo del día 15 incluido: respondida el día 15 cuenta «a tiempo». Vence cuando hoy > fecha + 15. */
  i16: (ss: SugerenciaFila[], hoy: Date): Calculo => {
    const hoyClave = claveDia(hoy);
    const evaluables = ss.filter((s) => s.respondidaEn !== null || hoyClave > claveDeSoloFecha(fechaLimiteSugerencia(s.fecha)));
    const aTiempo = evaluables.filter(
      (s) => s.respondidaEn !== null && claveDeSoloFecha(s.respondidaEn) <= claveDeSoloFecha(fechaLimiteSugerencia(s.fecha)),
    );
    return { valor: pct(aTiempo.length, evaluables.length), n: evaluables.length };
  },
};

// ───────────────────────── Estados ─────────────────────────

type Regla = (valor: number, base: number | null) => EstadoIndicador;

/** Meta «≥ umbral»; en camino si mejora frente a la base. */
const alMenos =
  (meta: number): Regla =>
  (v, base) =>
    v >= meta ? "cumple" : base !== null && v > base ? "en_camino" : "no_cumple";
/** Meta «≤ umbral»; en camino si baja frente a la base. */
const alMas =
  (meta: number): Regla =>
  (v, base) =>
    v <= meta ? "cumple" : base !== null && v < base ? "en_camino" : "no_cumple";

type Def = {
  id: IdIndicador;
  objetivo: Indicador["objetivo"];
  tactica: string;
  titulo: string;
  formato: FormatoIndicador;
  meta: string;
  formula: string;
};

export const CATALOGO: Record<IdIndicador, Def> = {
  I1: { id: "I1", objetivo: "O1", tactica: "A1 · uso del mapa", titulo: "Consultas dirigidas a la propietaria", formato: "porcentaje",
    meta: "≤ 50 % del valor base",
    formula: "De todas las consultas registradas en el periodo, el porcentaje que se dirigió primero a la propietaria. Se compara contra el mismo cálculo en la línea base: la meta es que baje a la mitad o menos." },
  I2: { id: "I2", objetivo: "O1", tactica: "Respuesta", titulo: "Consultas que recibieron respuesta", formato: "porcentaje",
    meta: "≥ 90 %",
    formula: "Consultas cerradas con respuesta ÷ consultas del periodo. No cuenta las que llevan abiertas menos de 24 horas; las abiertas hace más de 24 horas cuentan como sin respuesta." },
  I3: { id: "I3", objetivo: "O1", tactica: "Respuesta", titulo: "Respuestas el mismo día o en menos de 24 h", formato: "porcentaje",
    meta: "≥ 80 %",
    formula: "Consultas respondidas el mismo día o en menos de 24 horas ÷ las mismas consultas del indicador anterior." },
  I4: { id: "I4", objetivo: "O1", tactica: "Decisión", titulo: "Consultas decididas por un rol delegado", formato: "porcentaje",
    meta: "Mayor que en la línea base",
    formula: "De las consultas cerradas, el porcentaje que decidió un rol delegado (no la propietaria). La meta es superar el valor de la línea base." },
  I5: { id: "I5", objetivo: "O1", tactica: "Decisión", titulo: "Decisiones delegadas que se mantuvieron", formato: "porcentaje",
    meta: "≥ 90 %",
    formula: "De las consultas que decidió un rol delegado, el porcentaje que NO fue revertida." },
  I6: { id: "I6", objetivo: "O1", tactica: "Escalamiento", titulo: "Consultas escaladas a la propietaria", formato: "porcentaje",
    meta: "≤ 25 %",
    formula: "Consultas marcadas como escaladas ÷ consultas del periodo. Abajo se desglosa por motivo." },
  I7: { id: "I7", objetivo: "O1", tactica: "Percepción", titulo: "Respuesta resolutiva (pulso p6 · roles p7)", formato: "promedio",
    meta: "p6 ≥ 4,2 · p7 ≥ 4,0",
    formula: "Promedio de la afirmación 6 del pulso («recibo una respuesta que resuelve mi situación») y, aparte, de la afirmación 7 del pulso de roles («mis decisiones no son revertidas»)." },
  I8: { id: "I8", objetivo: "O2", tactica: "A2/A3 · información diaria", titulo: "Acceso a promociones, agotados y protocolos", formato: "promedio",
    meta: "≥ 4,5 y ninguna respuesta ≤ 3",
    formula: "Promedio de la afirmación 3 del pulso y número de respuestas con 3 o menos." },
  I9: { id: "I9", objetivo: "O2", tactica: "Información", titulo: "Consultas sobre productos y promociones", formato: "porcentaje",
    meta: "Reducción frente a la línea base",
    formula: "Porcentaje de las consultas del periodo que son de tipo «Producto o promoción», frente al mismo porcentaje en la línea base (se usa el porcentaje y no el conteo porque los periodos pueden durar distinto)." },
  I10: { id: "I10", objetivo: "O2", tactica: "A3 · kit de cabina", titulo: "Kits de cabina actualizados", formato: "fraccion",
    meta: "100 %",
    formula: "Cabinas con el kit actualizado ÷ total de cabinas (se edita en Ajustes)." },
  I11: { id: "I11", objetivo: "O3", tactica: "A4 · semáforo", titulo: "Comunicación entre recepción y cabinas", formato: "promedio",
    meta: "≥ 4,2",
    formula: "Promedio de la afirmación 4 del pulso." },
  I12: { id: "I12", objetivo: "O3", tactica: "A4 · semáforo", titulo: "Avisos con 15 minutos o más de anticipación", formato: "porcentaje",
    meta: "≥ 80 %",
    formula: "Avisos del semáforo con al menos 15 minutos de anticipación ÷ todos los avisos del periodo." },
  I13: { id: "I13", objetivo: "O3", tactica: "B1/B2 · escucha", titulo: "Seguridad para expresar desacuerdos", formato: "promedio",
    meta: "≥ 4,2 y ninguna respuesta ≤ 2",
    formula: "Promedio de la afirmación 5 del pulso y número de respuestas con 2 o menos." },
  I14: { id: "I14", objetivo: "O3", tactica: "B2 · mediación", titulo: "Mediaciones con acuerdo y seguimiento", formato: "porcentaje",
    meta: "≥ 80 %",
    formula: "Mediaciones con acuerdo y seguimiento hecho ÷ mediaciones que ya no están en curso." },
  I15: { id: "I15", objetivo: "O3", tactica: "B1 · círculos", titulo: "Círculos de bienestar realizados", formato: "fraccion",
    meta: "Todos los círculos de la meta (6 de 6)",
    formula: "Actas registradas desde el inicio de la línea base ÷ meta de círculos (se edita en Ajustes)." },
  I16: { id: "I16", objetivo: "O3", tactica: "B3 · buzón", titulo: "Sugerencias respondidas en 15 días o menos", formato: "porcentaje",
    meta: "100 %",
    formula: "Sugerencias respondidas dentro de los 15 días (el día 15 todavía cuenta) ÷ sugerencias cuyo plazo ya venció o que ya fueron respondidas." },
};

// ───────────────────────── Cálculo ─────────────────────────

/** Calcula un indicador de «dos rangos»: valor en P y valor en B, ambos protegidos por el umbral. */
function comparar(
  def: Def,
  ctx: Contexto,
  calcular: (r: Rango) => Calculo,
  regla: Regla,
  opciones: { requiereBase?: boolean } = {},
): Indicador {
  const p = proteger(calcular(ctx.periodo), ctx.umbral);
  const b = proteger(calcular(ctx.lineaBase), ctx.umbral);
  let estado: EstadoIndicador = "insuficiente";
  if (p.valor !== null) {
    estado = opciones.requiereBase && b.valor === null ? "insuficiente" : regla(p.valor, b.valor);
  }
  return { ...def, valor: p.valor, valorBase: b.valor, n: p.n, estado, detalle: p.detalle };
}

/** Promedio + conteo de respuestas bajas (I8, I13). */
function conBajas(
  def: Def,
  ctx: Contexto,
  filas: PulsoFila[],
  p: "p3" | "p5",
  metaProm: number,
  topeBajo: number,
): Indicador {
  const enP = porSoloFecha(filas, (x) => x.fecha, ctx.periodo);
  const enB = porSoloFecha(filas, (x) => x.fecha, ctx.lineaBase);
  const prom = proteger(f.promedioPulso(enP, p), ctx.umbral);
  const base = proteger(f.promedioPulso(enB, p), ctx.umbral);
  const suficiente = prom.valor !== null;
  const bajas = enP.filter((x) => x[p] <= topeBajo).length;
  let estado: EstadoIndicador = "insuficiente";
  if (suficiente) {
    if (prom.valor! >= metaProm && bajas === 0) estado = "cumple";
    else estado = base.valor !== null && prom.valor! > base.valor ? "en_camino" : "no_cumple";
  }
  return {
    ...def,
    valor: prom.valor,
    valorBase: base.valor,
    n: enP.length,
    estado,
    detalle: [{ etiqueta: `Respuestas de ${topeBajo} o menos`, valor: suficiente ? bajas : null, formato: "conteo", n: enP.length }],
  };
}

export function calcularIndicadores(filas: Filas, ctx: Contexto): Indicador[] {
  const { umbral, hoy } = ctx;
  const cons = (r: Rango) => porInstante(filas.consultas, (c) => c.abiertaEn, r);
  const pul = (r: Rango) => porSoloFecha(filas.pulsos, (x) => x.fecha, r);
  const rol = (r: Rango) => porSoloFecha(filas.pulsosRoles, (x) => x.fecha, r);

  const lista: Indicador[] = [];

  lista.push(
    comparar(CATALOGO.I1, ctx, (r) => f.i1(cons(r)), (v, b) => {
      if (b === null) return "insuficiente";
      return v <= b * 0.5 ? "cumple" : v < b ? "en_camino" : "no_cumple";
    }),
  );
  lista.push(comparar(CATALOGO.I2, ctx, (r) => f.i2(cons(r), hoy), alMenos(90)));
  lista.push(comparar(CATALOGO.I3, ctx, (r) => f.i3(cons(r), hoy), alMenos(80)));
  lista.push(comparar(CATALOGO.I4, ctx, (r) => f.i4(cons(r)), (v, b) => (b !== null && v > b ? "cumple" : "no_cumple")));
  lista.push(comparar(CATALOGO.I5, ctx, (r) => f.i5(cons(r)), alMenos(90)));
  lista.push(comparar(CATALOGO.I6, ctx, (r) => f.i6(cons(r)), alMas(25)));

  // I7: p6 (pulso) y p7 (roles), cada uno con su propia protección.
  {
    const p6 = proteger(f.promedioPulso(pul(ctx.periodo), "p6"), umbral);
    const p6b = proteger(f.promedioPulso(pul(ctx.lineaBase), "p6"), umbral);
    const p7 = proteger(f.p7(rol(ctx.periodo)), umbral);
    const p7b = proteger(f.p7(rol(ctx.lineaBase)), umbral);
    const estados: EstadoIndicador[] = [];
    if (p6.valor !== null) estados.push(alMenos(4.2)(p6.valor, p6b.valor));
    if (p7.valor !== null) estados.push(alMenos(4.0)(p7.valor, p7b.valor));
    const orden: EstadoIndicador[] = ["no_cumple", "en_camino", "cumple"];
    const estado = estados.length === 0 ? "insuficiente" : orden.find((e) => estados.includes(e))!;
    lista.push({
      ...CATALOGO.I7,
      valor: p6.valor,
      valorBase: p6b.valor,
      n: p6.n,
      estado,
      detalle: [{ etiqueta: "Promedio p7 (roles)", valor: p7.valor, formato: "promedio", n: p7.n }],
    });
  }

  lista.push(conBajas(CATALOGO.I8, ctx, filas.pulsos, "p3", 4.5, 3));
  lista.push(comparar(CATALOGO.I9, ctx, (r) => f.i9(cons(r)), (v, b) => (b !== null && v < b ? "cumple" : "no_cumple"), { requiereBase: true }));

  // I10: ajustes, no depende del periodo ni del umbral (no son datos de personas).
  {
    const total = ctx.ajustes.kitCabinasTotal;
    const act = ctx.ajustes.kitCabinasActualizadas;
    const estado: EstadoIndicador = total <= 0 ? "insuficiente" : act >= total ? "cumple" : act > 0 ? "en_camino" : "no_cumple";
    lista.push({ ...CATALOGO.I10, valor: total <= 0 ? null : act, valorBase: null, total, n: total, estado });
  }

  lista.push(comparar(CATALOGO.I11, ctx, (r) => f.promedioPulso(pul(r), "p4"), alMenos(4.2)));
  lista.push(comparar(CATALOGO.I12, ctx, (r) => f.i12(porInstante(filas.avisos, (a) => a.creadoEn, r)), alMenos(80)));
  lista.push(conBajas(CATALOGO.I13, ctx, filas.pulsos, "p5", 4.2, 2));
  lista.push(
    comparar(CATALOGO.I14, ctx, (r) => f.i14(porSoloFecha(filas.mediaciones, (m) => m.fecha, r)), alMenos(80)),
  );

  // I15: actas desde el inicio de la línea base hasta hoy.
  {
    const meta = ctx.ajustes.metaCirculos;
    const desde = ctx.ajustes.lineaBaseInicio;
    const n = filas.actas.filter((a) => claveDeSoloFecha(a.fecha) >= desde && claveDeSoloFecha(a.fecha) <= claveDia(hoy)).length;
    const estado: EstadoIndicador = meta <= 0 ? "insuficiente" : n >= meta ? "cumple" : n > 0 ? "en_camino" : "no_cumple";
    lista.push({ ...CATALOGO.I15, valor: meta <= 0 ? null : n, valorBase: null, total: meta, n, estado });
  }

  lista.push(
    comparar(CATALOGO.I16, ctx, (r) => f.i16(porSoloFecha(filas.sugerencias, (s) => s.fecha, r), hoy), (v, b) =>
      v >= 100 ? "cumple" : b !== null && v > b ? "en_camino" : "no_cumple",
    ),
  );

  return lista;
}

/** «X de 16 indicadores cumplen · Y en camino». */
export function resumen(indicadores: Indicador[]) {
  return {
    total: indicadores.length,
    cumplen: indicadores.filter((i) => i.estado === "cumple").length,
    enCamino: indicadores.filter((i) => i.estado === "en_camino").length,
    noCumplen: indicadores.filter((i) => i.estado === "no_cumple").length,
    insuficientes: indicadores.filter((i) => i.estado === "insuficiente").length,
  };
}

// ───────────────────────── Tendencia semanal ─────────────────────────

export type PuntoTendencia = { semana: string; valor: number | null; n: number };

/**
 * Valor semanal (semana ISO de Bogotá) de I1, I2 o I12 dentro del periodo.
 * Cada semana respeta el umbral: con n < umbral el valor es null (la gráfica deja un hueco).
 */
export function tendenciaSemanal(filas: Filas, id: "I1" | "I2" | "I12", ctx: Contexto): PuntoTendencia[] {
  const calcularSemana = (grupo: ConsultaFila[] | AvisoFila[]): Calculo =>
    id === "I1" ? f.i1(grupo as ConsultaFila[]) : id === "I2" ? f.i2(grupo as ConsultaFila[], ctx.hoy) : f.i12(grupo as AvisoFila[]);
  const fuente: Array<{ semana: string; fila: ConsultaFila | AvisoFila }> =
    id === "I12"
      ? porInstante(filas.avisos, (a) => a.creadoEn, ctx.periodo).map((a) => ({ semana: semanaISO(a.creadoEn), fila: a }))
      : porInstante(filas.consultas, (c) => c.abiertaEn, ctx.periodo).map((c) => ({ semana: semanaISO(c.abiertaEn), fila: c }));
  const grupos = new Map<string, Array<ConsultaFila | AvisoFila>>();
  for (const { semana, fila } of fuente) grupos.set(semana, [...(grupos.get(semana) ?? []), fila]);
  return [...grupos.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana, grupo]) => {
      const c = proteger(calcularSemana(grupo as ConsultaFila[] & AvisoFila[]), ctx.umbral);
      return { semana, valor: c.valor, n: c.n };
    });
}
