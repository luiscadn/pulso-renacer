import { describe, expect, it } from "vitest";
import { esquemaAjustes } from "./esquema";

const ok = {
  lineaBaseInicio: "2026-10-10", lineaBaseFin: "2026-10-23", umbralAnonimato: "3", metaCirculos: "6",
  cabinas: "Cabina 1, Cabina 2 ,Láser", kitCabinasActualizadas: "2", kitCabinasTotal: "4",
};
const mensaje = (o: Record<string, unknown>) => {
  const r = esquemaAjustes.safeParse({ ...ok, ...o });
  return r.success ? null : r.error.issues[0].message;
};

describe("esquemaAjustes", () => {
  it("acepta valores válidos y normaliza las cabinas", () => {
    const r = esquemaAjustes.parse(ok);
    expect(r.cabinas).toEqual(["Cabina 1", "Cabina 2", "Láser"]);
    expect(r.umbralAnonimato).toBe(3);
  });
  it("umbral menor que 3 se rechaza", () => expect(mensaje({ umbralAnonimato: "2" })).toMatch(/3 o más/));
  it("meta menor que 1 se rechaza", () => expect(mensaje({ metaCirculos: "0" })).toMatch(/1 o más/));
  it("fechas inválidas o inexistentes se rechazan", () => {
    expect(mensaje({ lineaBaseInicio: "10/10/2026" })).toBeTruthy();
    expect(mensaje({ lineaBaseInicio: "2026-02-31" })).toMatch(/no existe/);
  });
  it("el fin no puede ser anterior al inicio", () => expect(mensaje({ lineaBaseFin: "2026-10-01" })).toMatch(/terminar/));
  it("cabinas vacías se rechazan", () => expect(mensaje({ cabinas: " , " })).toMatch(/al menos una/));
  it("actualizadas no puede superar el total", () => expect(mensaje({ kitCabinasActualizadas: "5" })).toMatch(/más que el total/));
  it("rechaza números no enteros o texto", () => {
    expect(mensaje({ umbralAnonimato: "3.5" })).toBeTruthy();
    expect(mensaje({ metaCirculos: "abc" })).toBeTruthy();
  });
});
