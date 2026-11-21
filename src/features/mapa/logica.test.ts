import { describe, expect, it } from "vitest";
import { coincideBusqueda, filtrarSituaciones, normalizar, reordenar } from "./logica";

const s = { titulo: "Cambio de promoción", ejemplo: "Una paciente pide descuento", quienResuelve: "Administradora", tipo: "PRODUCTO_PROMOCION" };

describe("normalizar", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizar("  PROMOCIÓN Áéíóú ñ ")).toBe("promocion aeiou n");
  });
});

describe("coincideBusqueda", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(coincideBusqueda(s, "PROMOCION")).toBe(true);
    expect(coincideBusqueda(s, "administradora")).toBe(true);
  });
  it("exige todas las palabras", () => {
    expect(coincideBusqueda(s, "paciente descuento")).toBe(true);
    expect(coincideBusqueda(s, "paciente turno")).toBe(false);
  });
  it("búsqueda vacía coincide con todo", () => {
    expect(coincideBusqueda(s, "   ")).toBe(true);
  });
});

describe("filtrarSituaciones", () => {
  it("combina tipo y texto", () => {
    const otra = { ...s, titulo: "Turno", tipo: "PERMISO_TURNO" };
    expect(filtrarSituaciones([s, otra], "", "PERMISO_TURNO")).toEqual([otra]);
    expect(filtrarSituaciones([s, otra], "promocion", null)).toEqual([s]);
  });
});

describe("reordenar", () => {
  it("sube y baja", () => {
    expect(reordenar(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
    expect(reordenar(["a", "b", "c"], "b", 1)).toEqual(["a", "c", "b"]);
  });
  it("no se sale de los extremos ni con ids inexistentes", () => {
    expect(reordenar(["a", "b"], "a", -1)).toEqual(["a", "b"]);
    expect(reordenar(["a", "b"], "b", 1)).toEqual(["a", "b"]);
    expect(reordenar(["a", "b"], "z", 1)).toEqual(["a", "b"]);
  });
  it("no muta la entrada", () => {
    const e = ["a", "b"];
    reordenar(e, "a", 1);
    expect(e).toEqual(["a", "b"]);
  });
});
