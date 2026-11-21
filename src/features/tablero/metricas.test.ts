import { describe, expect, it } from "vitest";
import {
  calcularIndicadores,
  consultasEvaluables,
  FILAS_VACIAS,
  resumen,
  tendenciaSemanal,
  type AvisoFila,
  type ConsultaFila,
  type Contexto,
  type Filas,
  type IdIndicador,
  type PulsoFila,
} from "./metricas";
import { resolverPeriodo } from "./periodo";
import { formatearValor } from "./formato";

// «Hoy» = 2026-11-20 17:00 Bogotá (22:00 UTC). Periodo: 7–20 nov. Línea base: 10–23 oct.
const HOY = new Date("2026-11-20T22:00:00Z");
const ctx: Contexto = {
  periodo: { desde: "2026-11-07", hasta: "2026-11-20" },
  lineaBase: { desde: "2026-10-10", hasta: "2026-10-23" },
  hoy: HOY,
  umbral: 3,
  ajustes: { metaCirculos: 6, kitCabinasActualizadas: 2, kitCabinasTotal: 4, lineaBaseInicio: "2026-10-10" },
};

const enP = (dia: number, h = 15) => new Date(`2026-11-${String(dia).padStart(2, "0")}T${String(h + 5).padStart(2, "0")}:00:00Z`);
const enB = (dia: number, h = 15) => new Date(`2026-10-${String(dia).padStart(2, "0")}T${String(h + 5).padStart(2, "0")}:00:00Z`);
const d = (s: string) => new Date(`${s}T00:00:00Z`);

function consulta(o: Partial<ConsultaFila> = {}): ConsultaFila {
  return {
    abiertaEn: enP(10), cerradaEn: enP(10, 16), tipo: "AGENDA", dirigidaA: "ADMINISTRADORA",
    recibioRespuesta: true, tiempoRespuesta: "MISMO_DIA", decidio: "ROL_DELEGADO", escalada: false,
    motivoEscalamiento: null, revertida: false, ...o,
  };
}
const varias = <T,>(n: number, mk: (i: number) => T) => Array.from({ length: n }, (_, i) => mk(i));
const filas = (p: Partial<Filas>): Filas => ({ ...FILAS_VACIAS, ...p });
const ind = (f: Filas, id: IdIndicador, c: Contexto = ctx) => calcularIndicadores(f, c).find((i) => i.id === id)!;
const pulso = (o: Partial<PulsoFila> = {}, fecha = "2026-11-12"): PulsoFila => ({ fecha: d(fecha), p1: 4, p2: 4, p3: 4, p4: 4, p5: 4, p6: 4, ...o });

describe("calcularIndicadores", () => {
  it("devuelve los 16 indicadores", () => {
    const r = calcularIndicadores(FILAS_VACIAS, ctx);
    expect(r.map((i) => i.id)).toEqual(["I1","I2","I3","I4","I5","I6","I7","I8","I9","I10","I11","I12","I13","I14","I15","I16"]);
  });

  describe("regla de anonimato", () => {
    it("n < umbral → insuficiente y sin valor", () => {
      const r = ind(filas({ consultas: [consulta(), consulta()] }), "I2");
      expect(r.estado).toBe("insuficiente");
      expect(r.valor).toBeNull();
      expect(r.n).toBe(2);
    });
    it("n = umbral sí se calcula", () => {
      const r = ind(filas({ consultas: varias(3, () => consulta()) }), "I2");
      expect(r.valor).toBe(100);
      expect(r.estado).toBe("cumple");
    });
    it("respeta un umbral configurado más alto", () => {
      const r = ind(filas({ consultas: varias(4, () => consulta()) }), "I2", { ...ctx, umbral: 5 });
      expect(r.estado).toBe("insuficiente");
    });
    it("denominador 0 → insuficiente, no NaN", () => {
      const r = ind(FILAS_VACIAS, "I12");
      expect(r.valor).toBeNull();
      expect(r.n).toBe(0);
      expect(r.estado).toBe("insuficiente");
    });
    it("el detalle también se oculta (I6 por motivo)", () => {
      const r = ind(filas({ consultas: [consulta({ escalada: true, motivoEscalamiento: "OTRO" })] }), "I6");
      expect(r.detalle?.every((x) => x.valor === null)).toBe(true);
    });
    it("ignora filas fuera del periodo", () => {
      const fuera = varias(5, () => consulta({ abiertaEn: new Date("2026-09-01T15:00:00Z") }));
      expect(ind(filas({ consultas: fuera }), "I2").n).toBe(0);
    });
    it("el borde del periodo se evalúa en Bogotá (00:30 Bogotá del 7 nov = 05:30 UTC, dentro; 23:30 del 6 nov = 04:30 UTC del 7, fuera)", () => {
      const dentro = consulta({ abiertaEn: new Date("2026-11-07T05:30:00Z") });
      const fuera = consulta({ abiertaEn: new Date("2026-11-07T04:30:00Z") });
      expect(ind(filas({ consultas: [dentro, fuera] }), "I1").n).toBe(1);
    });
  });

  describe("I1 · uso de la propietaria vs línea base", () => {
    const base = [
      ...varias(6, () => consulta({ abiertaEn: enB(15), dirigidaA: "PROPIETARIA" })),
      ...varias(4, () => consulta({ abiertaEn: enB(16) })),
    ]; // 60 %
    it("cumple si es ≤ 50 % del valor base (30 %)", () => {
      const p = [...varias(3, () => consulta({ dirigidaA: "PROPIETARIA" })), ...varias(7, () => consulta())];
      const r = ind(filas({ consultas: [...base, ...p] }), "I1");
      expect(r.valorBase).toBeCloseTo(60);
      expect(r.valor).toBeCloseTo(30);
      expect(r.estado).toBe("cumple");
    });
    it("el límite exacto (30 % de 60 %) cumple", () => {
      const p = [...varias(3, () => consulta({ dirigidaA: "PROPIETARIA" })), ...varias(7, () => consulta())];
      expect(ind(filas({ consultas: [...base, ...p] }), "I1").estado).toBe("cumple");
    });
    it("en camino si baja pero no llega a la mitad (40 %)", () => {
      const p = [...varias(4, () => consulta({ dirigidaA: "PROPIETARIA" })), ...varias(6, () => consulta())];
      expect(ind(filas({ consultas: [...base, ...p] }), "I1").estado).toBe("en_camino");
    });
    it("no cumple si no baja (70 %)", () => {
      const p = [...varias(7, () => consulta({ dirigidaA: "PROPIETARIA" })), ...varias(3, () => consulta())];
      expect(ind(filas({ consultas: [...base, ...p] }), "I1").estado).toBe("no_cumple");
    });
    it("sin línea base suficiente no se puede comparar → insuficiente", () => {
      const p = varias(5, () => consulta());
      const r = ind(filas({ consultas: p }), "I1");
      expect(r.valor).toBe(0);
      expect(r.valorBase).toBeNull();
      expect(r.estado).toBe("insuficiente");
    });
  });

  describe("I2 e I3 · respuesta y rapidez", () => {
    it("excluye las abiertas hace menos de 24 h", () => {
      const reciente = consulta({ abiertaEn: new Date(HOY.getTime() - 23 * 3_600_000), cerradaEn: null, recibioRespuesta: null, tiempoRespuesta: null });
      expect(consultasEvaluables([reciente], HOY)).toHaveLength(0);
      const r = ind(filas({ consultas: [...varias(3, () => consulta()), reciente] }), "I2");
      expect(r.n).toBe(3);
      expect(r.valor).toBe(100);
    });
    it("cuenta como sin respuesta las abiertas hace más de 24 h", () => {
      const vieja = consulta({ abiertaEn: new Date(HOY.getTime() - 25 * 3_600_000), cerradaEn: null, recibioRespuesta: null, tiempoRespuesta: null });
      const r = ind(filas({ consultas: [...varias(3, () => consulta()), vieja] }), "I2");
      expect(r.n).toBe(4);
      expect(r.valor).toBe(75);
      expect(r.estado).toBe("no_cumple");
    });
    it("exactamente 24 h ya cuenta", () => {
      const justo = consulta({ abiertaEn: new Date(HOY.getTime() - 24 * 3_600_000), cerradaEn: null, recibioRespuesta: null, tiempoRespuesta: null });
      expect(consultasEvaluables([justo], HOY)).toHaveLength(1);
    });
    it("I2: cerrada sin respuesta no suma", () => {
      const sin = consulta({ recibioRespuesta: false, tiempoRespuesta: "SIN_RESPUESTA" });
      const r = ind(filas({ consultas: [...varias(9, () => consulta()), sin] }), "I2");
      expect(r.valor).toBe(90);
      expect(r.estado).toBe("cumple");
    });
    it("I2: en camino si mejora frente a la base", () => {
      const base = varias(4, (i) => consulta({ abiertaEn: enB(15), recibioRespuesta: i === 0, tiempoRespuesta: i === 0 ? "MISMO_DIA" : "SIN_RESPUESTA" })); // 25 %
      const p = [...varias(7, () => consulta()), ...varias(3, () => consulta({ recibioRespuesta: false, tiempoRespuesta: "SIN_RESPUESTA" }))]; // 70 %
      const r = ind(filas({ consultas: [...base, ...p] }), "I2");
      expect(r.valorBase).toBe(25);
      expect(r.estado).toBe("en_camino");
    });
    it("I3: solo MISMO_DIA y MENOS_24H, con el mismo denominador que I2", () => {
      const cs = [
        consulta({ tiempoRespuesta: "MISMO_DIA" }), consulta({ tiempoRespuesta: "MENOS_24H" }),
        consulta({ tiempoRespuesta: "MAS_24H" }), consulta({ tiempoRespuesta: "MENOS_24H" }),
        consulta({ tiempoRespuesta: "SIN_RESPUESTA", recibioRespuesta: false }),
      ];
      const r = ind(filas({ consultas: cs }), "I3");
      expect(r.n).toBe(5);
      expect(r.valor).toBe(60);
      expect(r.estado).toBe("no_cumple");
      expect(ind(filas({ consultas: cs }), "I2").n).toBe(r.n);
    });
    it("I3: cumple con 80 %", () => {
      const cs = [...varias(4, () => consulta()), consulta({ tiempoRespuesta: "MAS_24H" })];
      expect(ind(filas({ consultas: cs }), "I3").estado).toBe("cumple");
    });
  });

  describe("I4 y I5 · decisión", () => {
    it("I4: solo cuenta las cerradas y cumple si supera la base", () => {
      const base = [...varias(2, () => consulta({ abiertaEn: enB(15), decidio: "ROL_DELEGADO" })), ...varias(2, () => consulta({ abiertaEn: enB(15), decidio: "PROPIETARIA" }))]; // 50 %
      const p = [...varias(3, () => consulta({ decidio: "ROL_DELEGADO" })), consulta({ decidio: "PROPIETARIA" }), consulta({ cerradaEn: null, decidio: null, recibioRespuesta: null })];
      const r = ind(filas({ consultas: [...base, ...p] }), "I4");
      expect(r.n).toBe(4);
      expect(r.valor).toBe(75);
      expect(r.valorBase).toBe(50);
      expect(r.estado).toBe("cumple");
    });
    it("I4: no cumple si no supera la base", () => {
      const base = varias(4, () => consulta({ abiertaEn: enB(15), decidio: "ROL_DELEGADO" }));
      const p = varias(4, (i) => consulta({ decidio: i < 2 ? "ROL_DELEGADO" : "PROPIETARIA" }));
      expect(ind(filas({ consultas: [...base, ...p] }), "I4").estado).toBe("no_cumple");
    });
    it("I5: solo sobre las que decidió un rol delegado", () => {
      const cs = [
        ...varias(9, () => consulta({ decidio: "ROL_DELEGADO" })),
        consulta({ decidio: "ROL_DELEGADO", revertida: true }),
        ...varias(20, () => consulta({ decidio: "PROPIETARIA", revertida: true })), // no cuentan
      ];
      const r = ind(filas({ consultas: cs }), "I5");
      expect(r.n).toBe(10);
      expect(r.valor).toBe(90);
      expect(r.estado).toBe("cumple");
    });
    it("I5: no cumple por debajo del 90 %", () => {
      const cs = [...varias(8, () => consulta()), ...varias(2, () => consulta({ revertida: true }))];
      expect(ind(filas({ consultas: cs }), "I5").estado).toBe("no_cumple");
    });
  });

  describe("I6 · escalamiento", () => {
    it("calcula el porcentaje y el desglose por motivo", () => {
      const cs = [
        consulta({ escalada: true, motivoEscalamiento: "NO_CORRESPONDIA" }),
        consulta({ escalada: true, motivoEscalamiento: "NO_CORRESPONDIA" }),
        consulta({ escalada: true, motivoEscalamiento: "OTRO" }),
        ...varias(5, () => consulta()),
      ];
      const r = ind(filas({ consultas: cs }), "I6");
      expect(r.valor).toBe(37.5);
      expect(r.detalle?.find((x) => x.etiqueta === "No le correspondía a ese rol")?.valor).toBe(2);
      expect(r.detalle?.find((x) => x.etiqueta === "Otro motivo")?.valor).toBe(1);
      expect(r.estado).toBe("no_cumple");
    });
    it("cumple con ≤ 25 % y en camino si baja frente a la base", () => {
      expect(ind(filas({ consultas: [consulta({ escalada: true }), ...varias(3, () => consulta())] }), "I6").estado).toBe("cumple");
      const base = varias(4, () => consulta({ abiertaEn: enB(15), escalada: true }));
      const p = [...varias(2, () => consulta({ escalada: true })), ...varias(4, () => consulta())];
      expect(ind(filas({ consultas: [...base, ...p] }), "I6").estado).toBe("en_camino");
    });
  });

  describe("I7 · p6 y p7", () => {
    const ps = [pulso({ p6: 5 }), pulso({ p6: 4 }), pulso({ p6: 5 })];
    const rs = varias(3, () => ({ fecha: d("2026-11-12"), p7: 4 }));
    it("p6 ≥ 4,2 y p7 ≥ 4,0 → cumple", () => {
      const r = ind(filas({ pulsos: ps, pulsosRoles: rs }), "I7");
      expect(r.valor).toBeCloseTo(4.667, 2);
      expect(r.detalle?.[0].valor).toBe(4);
      expect(r.estado).toBe("cumple");
    });
    it("si p7 no alcanza, el estado es el peor de los dos", () => {
      const bajos = varias(3, () => ({ fecha: d("2026-11-12"), p7: 3 }));
      expect(ind(filas({ pulsos: ps, pulsosRoles: bajos }), "I7").estado).toBe("no_cumple");
    });
    it("p7 con n < umbral se oculta pero p6 se muestra", () => {
      const r = ind(filas({ pulsos: ps, pulsosRoles: [rs[0]] }), "I7");
      expect(r.detalle?.[0].valor).toBeNull();
      expect(r.valor).not.toBeNull();
    });
    it("sin datos → insuficiente", () => expect(ind(FILAS_VACIAS, "I7").estado).toBe("insuficiente"));
  });

  describe("I8 y I13 · promedio y respuestas bajas", () => {
    it("I8: promedio alto pero una respuesta ≤ 3 → no cumple", () => {
      const ps = [pulso({ p3: 5 }), pulso({ p3: 5 }), pulso({ p3: 5 }), pulso({ p3: 5 }), pulso({ p3: 3 })];
      const r = ind(filas({ pulsos: ps }), "I8");
      expect(r.valor).toBeCloseTo(4.6);
      expect(r.detalle?.[0].valor).toBe(1);
      expect(r.estado).toBe("no_cumple");
    });
    it("I8: cumple de verdad", () => {
      const r = ind(filas({ pulsos: [pulso({ p3: 5 }), pulso({ p3: 5 }), pulso({ p3: 5 }), pulso({ p3: 4 })] }), "I8");
      expect(r.estado).toBe("cumple");
    });
    it("I8: en camino si mejora frente a la base", () => {
      const base = varias(3, () => pulso({ p3: 3 }, "2026-10-15"));
      const p = varias(3, () => pulso({ p3: 4 }));
      expect(ind(filas({ pulsos: [...base, ...p] }), "I8").estado).toBe("en_camino");
    });
    it("I8: n < umbral → insuficiente y sin conteo de bajas", () => {
      const r = ind(filas({ pulsos: [pulso({ p3: 1 }), pulso({ p3: 1 })] }), "I8");
      expect(r.estado).toBe("insuficiente");
      expect(r.detalle?.[0].valor).toBeNull();
    });
    it("I13: respuestas ≤ 2 impiden cumplir", () => {
      const ps = [pulso({ p5: 5 }), pulso({ p5: 5 }), pulso({ p5: 5 }), pulso({ p5: 2 })];
      const r = ind(filas({ pulsos: ps }), "I13");
      expect(r.detalle?.[0].valor).toBe(1);
      expect(r.estado).not.toBe("cumple");
    });
    it("I13: cumple con ≥ 4,2 y sin respuestas ≤ 2 (un 3 no cuenta como baja)", () => {
      const ps = [pulso({ p5: 5 }), pulso({ p5: 5 }), pulso({ p5: 4 }), pulso({ p5: 4 }), pulso({ p5: 3 }), pulso({ p5: 5 })];
      const r = ind(filas({ pulsos: ps }), "I13");
      expect(r.valor).toBeCloseTo(4.333, 2);
      expect(r.estado).toBe("cumple");
    });
  });

  describe("I9 · productos y promociones", () => {
    const base = [...varias(4, () => consulta({ abiertaEn: enB(15), tipo: "PRODUCTO_PROMOCION" })), ...varias(6, () => consulta({ abiertaEn: enB(15) }))]; // 40 %
    it("cumple si la proporción baja", () => {
      const p = [consulta({ tipo: "PRODUCTO_PROMOCION" }), ...varias(4, () => consulta())];
      const r = ind(filas({ consultas: [...base, ...p] }), "I9");
      expect(r.valor).toBe(20);
      expect(r.estado).toBe("cumple");
    });
    it("no cumple si no baja", () => {
      const p = [...varias(3, () => consulta({ tipo: "PRODUCTO_PROMOCION" })), ...varias(2, () => consulta())];
      expect(ind(filas({ consultas: [...base, ...p] }), "I9").estado).toBe("no_cumple");
    });
  });

  describe("I10 · kit de cabinas", () => {
    it("2 de 4 → en camino", () => {
      const r = ind(FILAS_VACIAS, "I10");
      expect(r.valor).toBe(2);
      expect(r.total).toBe(4);
      expect(r.estado).toBe("en_camino");
    });
    it("4 de 4 cumple; 0 de 4 no cumple; total 0 insuficiente", () => {
      const con = (a: number, t: number) => ({ ...ctx, ajustes: { ...ctx.ajustes, kitCabinasActualizadas: a, kitCabinasTotal: t } });
      expect(ind(FILAS_VACIAS, "I10", con(4, 4)).estado).toBe("cumple");
      expect(ind(FILAS_VACIAS, "I10", con(0, 4)).estado).toBe("no_cumple");
      expect(ind(FILAS_VACIAS, "I10", con(0, 0)).estado).toBe("insuficiente");
    });
  });

  describe("I11 · p4", () => {
    it("cumple con ≥ 4,2", () => expect(ind(filas({ pulsos: varias(3, () => pulso({ p4: 5 })) }), "I11").estado).toBe("cumple"));
    it("no cumple con 4,0 sin base", () => expect(ind(filas({ pulsos: varias(3, () => pulso({ p4: 4 })) }), "I11").estado).toBe("no_cumple"));
    it("en camino frente a la base", () => {
      const base = varias(3, () => pulso({ p4: 3 }, "2026-10-15"));
      expect(ind(filas({ pulsos: [...base, ...varias(3, () => pulso({ p4: 4 })) ] }), "I11").estado).toBe("en_camino");
    });
  });

  describe("I12 · avisos con anticipación", () => {
    const aviso = (min: number, o: Partial<AvisoFila> = {}): AvisoFila => ({ creadoEn: enP(10), minutosAnticipacion: min, ...o });
    it("15 min exactos cuentan como a tiempo", () => {
      const r = ind(filas({ avisos: [aviso(15), aviso(15), aviso(14), aviso(30), aviso(60)] }), "I12");
      expect(r.valor).toBe(80);
      expect(r.estado).toBe("cumple");
    });
    it("no cumple con 50 %", () => {
      expect(ind(filas({ avisos: [aviso(0), aviso(5), aviso(20), aviso(30)] }), "I12").estado).toBe("no_cumple");
    });
    it("n < umbral → insuficiente", () => expect(ind(filas({ avisos: [aviso(30)] }), "I12").estado).toBe("insuficiente"));
  });

  describe("I14 · mediaciones", () => {
    const m = (resultado: "ACUERDO" | "SIN_ACUERDO_ESCALADA" | "EN_CURSO", seguimientoHecho: boolean) => ({ fecha: d("2026-11-10"), resultado, seguimientoHecho });
    it("excluye las en curso del denominador", () => {
      const r = ind(filas({ mediaciones: [m("ACUERDO", true), m("ACUERDO", true), m("ACUERDO", true), m("EN_CURSO", false), m("EN_CURSO", false)] }), "I14");
      expect(r.n).toBe(3);
      expect(r.valor).toBe(100);
      expect(r.estado).toBe("cumple");
    });
    it("acuerdo sin seguimiento no cuenta", () => {
      const r = ind(filas({ mediaciones: [m("ACUERDO", true), m("ACUERDO", false), m("SIN_ACUERDO_ESCALADA", false)] }), "I14");
      expect(r.valor).toBeCloseTo(33.33, 1);
      expect(r.estado).toBe("no_cumple");
    });
    it("con 2 mediaciones cerradas → insuficiente", () => {
      expect(ind(filas({ mediaciones: [m("ACUERDO", true), m("ACUERDO", true)] }), "I14").estado).toBe("insuficiente");
    });
  });

  describe("I15 · círculos", () => {
    const acta = (f: string) => ({ fecha: d(f) });
    it("cuenta desde lineaBaseInicio hasta hoy", () => {
      const r = ind(filas({ actas: [acta("2026-10-09"), acta("2026-10-10"), acta("2026-10-25"), acta("2026-11-20"), acta("2026-11-21")] }), "I15");
      expect(r.valor).toBe(3);
      expect(r.total).toBe(6);
      expect(r.estado).toBe("en_camino");
    });
    it("6 de 6 cumple y 0 no cumple", () => {
      expect(ind(filas({ actas: varias(6, () => acta("2026-11-01")) }), "I15").estado).toBe("cumple");
      expect(ind(FILAS_VACIAS, "I15").estado).toBe("no_cumple");
    });
  });

  describe("I16 · sugerencias en 15 días", () => {
    // Sugerencia del 2026-11-05: plazo = 2026-11-20 (día 15).
    const s = (fecha: string, resp: string | null) => ({ fecha: d(fecha), respondidaEn: resp ? d(resp) : null });
    it("respondida el día 15 exacto cuenta a tiempo; el día 16 no", () => {
      const amplio = { ...ctx, periodo: { desde: "2026-11-01", hasta: "2026-11-20" } };
      const r = ind(filas({ sugerencias: [s("2026-11-05", "2026-11-20"), s("2026-11-05", "2026-11-19"), s("2026-11-05", "2026-11-21")] }), "I16", amplio);
      expect(r.n).toBe(3);
      expect(r.valor).toBeCloseTo(66.67, 1);
    });
    it("sin responder: el día 15 aún no vence; el 16 sí", () => {
      const pendientes = varias(3, () => s("2026-11-05", null));
      expect(ind(filas({ sugerencias: pendientes }), "I16", { ...ctx, periodo: { desde: "2026-11-01", hasta: "2026-11-20" } }).n).toBe(0); // hoy = 20 nov = día 15
      const manana = { ...ctx, hoy: new Date("2026-11-21T17:00:00Z") };
      const r = ind(filas({ sugerencias: pendientes }), "I16", { ...manana, periodo: { desde: "2026-11-01", hasta: "2026-11-21" } });
      expect(r.n).toBe(3);
      expect(r.valor).toBe(0);
      expect(r.estado).toBe("no_cumple");
    });
    it("100 % cumple", () => {
      const r = ind(filas({ sugerencias: varias(3, () => s("2026-11-08", "2026-11-10")) }), "I16");
      expect(r.valor).toBe(100);
      expect(r.estado).toBe("cumple");
    });
    it("los 15 días cruzan el cambio de mes", () => {
      const r = ind(filas({ sugerencias: varias(3, () => s("2026-11-15", "2026-11-30")) }), "I16");
      expect(r.valor).toBe(100);
    });
    it("en camino si mejora frente a la base", () => {
      const base = [s("2026-10-12", "2026-10-30"), s("2026-10-12", "2026-10-30"), s("2026-10-12", "2026-10-20")]; // 1/3
      const p = [s("2026-11-08", "2026-11-10"), s("2026-11-08", "2026-11-10"), s("2026-11-08", "2026-11-30")]; // 2/3
      expect(ind(filas({ sugerencias: [...base, ...p] }), "I16").estado).toBe("en_camino");
    });
  });
});

describe("resumen", () => {
  it("cuenta por estado", () => {
    const r = resumen(calcularIndicadores(FILAS_VACIAS, ctx));
    expect(r.total).toBe(16);
    expect(r.cumplen + r.enCamino + r.noCumplen + r.insuficientes).toBe(16);
    expect(r.enCamino).toBeGreaterThanOrEqual(1); // I10 (2 de 4)
  });
});

describe("tendenciaSemanal", () => {
  it("agrupa por semana ISO de Bogotá y oculta semanas con n < umbral", () => {
    const sem1 = varias(4, (i) => consulta({ abiertaEn: enP(9), dirigidaA: i < 2 ? "PROPIETARIA" : "RECEPCION" })); // lun 9 nov, W46
    const sem2 = [consulta({ abiertaEn: enP(16), dirigidaA: "PROPIETARIA" })]; // W47, n=1
    const t = tendenciaSemanal(filas({ consultas: [...sem1, ...sem2] }), "I1", ctx);
    expect(t).toEqual([
      { semana: "2026-W46", valor: 50, n: 4 },
      { semana: "2026-W47", valor: null, n: 1 },
    ]);
  });
  it("I12 usa los avisos", () => {
    const avisos = varias(3, () => ({ creadoEn: enP(10), minutosAnticipacion: 20 }));
    expect(tendenciaSemanal(filas({ avisos }), "I12", ctx)[0].valor).toBe(100);
  });
  it("I2 aplica la regla de 24 h", () => {
    const t = tendenciaSemanal(filas({ consultas: varias(3, () => consulta()) }), "I2", ctx);
    expect(t[0].valor).toBe(100);
  });
  it("sin datos devuelve arreglo vacío", () => expect(tendenciaSemanal(FILAS_VACIAS, "I1", ctx)).toEqual([]));
});

describe("resolverPeriodo", () => {
  it("14 días por defecto, incluyendo hoy (Bogotá)", () => {
    const r = resolverPeriodo({}, new Date("2026-11-21T03:00:00Z")); // 20 nov 22:00 Bogotá
    expect(r).toEqual({ opcion: "14", periodo: { desde: "2026-11-07", hasta: "2026-11-20" } });
  });
  it("30 días", () => expect(resolverPeriodo({ p: "30" }, HOY).periodo).toEqual({ desde: "2026-10-22", hasta: "2026-11-20" }));
  it("rango válido, invertido, futuro y basura", () => {
    expect(resolverPeriodo({ p: "rango", desde: "2026-11-01", hasta: "2026-11-10" }, HOY).periodo).toEqual({ desde: "2026-11-01", hasta: "2026-11-10" });
    expect(resolverPeriodo({ p: "rango", desde: "2026-11-10", hasta: "2026-11-01" }, HOY).periodo).toEqual({ desde: "2026-11-01", hasta: "2026-11-10" });
    expect(resolverPeriodo({ p: "rango", desde: "2026-11-10", hasta: "2030-01-01" }, HOY).periodo.hasta).toBe("2026-11-20");
    expect(resolverPeriodo({ p: "rango", desde: "xx", hasta: "2026-11-10" }, HOY).opcion).toBe("14");
    expect(resolverPeriodo({ p: "rango", desde: "2026-02-31", hasta: "2026-11-10" }, HOY).opcion).toBe("14");
  });
});

describe("formatearValor", () => {
  it("usa coma decimal", () => {
    expect(formatearValor(62.5, "porcentaje")).toBe("62,5 %");
    expect(formatearValor(90, "porcentaje")).toBe("90 %");
    expect(formatearValor(4.2, "promedio")).toBe("4,20");
    expect(formatearValor(2, "fraccion", 4)).toBe("2 de 4");
    expect(formatearValor(null, "promedio")).toBe("—");
  });
});
