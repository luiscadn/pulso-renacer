import { describe, expect, it } from "vitest";
import { contarCirculos } from "./conteo";
import { esquemaActa, esquemaMediacion, esquemaMediacionEdicion } from "./esquemas";

const acta = { fecha: "2026-11-10", funciono: "a", seTrabo: "b", carga: "c", acordamos: "d" };

describe("esquemaActa", () => {
  it("acepta un acta completa y recorta espacios", () => {
    expect(esquemaActa.parse({ ...acta, funciono: "  bien  " }).funciono).toBe("bien");
  });
  it("exige los cuatro apartados", () => {
    for (const campo of ["funciono", "seTrabo", "carga", "acordamos"] as const) {
      expect(esquemaActa.safeParse({ ...acta, [campo]: "   " }).success).toBe(false);
    }
  });
  it("limita cada campo a 300 caracteres", () => {
    expect(esquemaActa.safeParse({ ...acta, carga: "x".repeat(300) }).success).toBe(true);
    expect(esquemaActa.safeParse({ ...acta, carga: "x".repeat(301) }).success).toBe(false);
  });
  it("rechaza fechas mal formadas o futuras", () => {
    expect(esquemaActa.safeParse({ ...acta, fecha: "10/11/2026" }).success).toBe(false);
    expect(esquemaActa.safeParse({ ...acta, fecha: "2999-01-01" }).success).toBe(false);
  });
});

describe("mediaciones", () => {
  it("valida el resultado con el enum", () => {
    expect(esquemaMediacion.safeParse({ fecha: "2026-11-10", resultado: "ACUERDO" }).success).toBe(true);
    expect(esquemaMediacion.safeParse({ fecha: "2026-11-10", resultado: "OTRO" }).success).toBe(false);
  });
  it("convierte la casilla de seguimiento a booleano", () => {
    expect(esquemaMediacionEdicion.parse({ id: "x", resultado: "EN_CURSO", seguimientoHecho: "on" }).seguimientoHecho).toBe(true);
    expect(esquemaMediacionEdicion.parse({ id: "x", resultado: "EN_CURSO", seguimientoHecho: false }).seguimientoHecho).toBe(false);
  });
});

describe("contarCirculos", () => {
  const f = (s: string) => new Date(`${s}T00:00:00.000Z`);
  it("cuenta solo las actas desde la línea base (inclusive)", () => {
    const fechas = [f("2026-10-30"), f("2026-11-01"), f("2026-11-15")];
    expect(contarCirculos(fechas, "2026-11-01")).toBe(2);
  });
  it("sin línea base cuenta todas; sin actas, cero", () => {
    expect(contarCirculos([f("2026-01-01")], null)).toBe(1);
    expect(contarCirculos([], "2026-11-01")).toBe(0);
  });
});
