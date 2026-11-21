import { describe, expect, it } from "vitest";
import { estadoPlazo } from "./plazo";

const f = (iso: string) => new Date(`${iso}T00:00:00.000Z`); // columna @db.Date
const hoy = (iso: string) => new Date(`${iso}T15:00:00.000Z`); // 10 a. m. en Bogotá

describe("estadoPlazo", () => {
  const fecha = f("2026-11-01"); // límite: 16 de noviembre
  it("a tiempo cuando faltan más de 5 días", () => {
    expect(estadoPlazo(fecha, null, hoy("2026-11-02"))).toBe("a_tiempo");
    expect(estadoPlazo(fecha, null, hoy("2026-11-10"))).toBe("a_tiempo");
  });
  it("por vencer cuando faltan 5 días o menos", () => {
    expect(estadoPlazo(fecha, null, hoy("2026-11-11"))).toBe("por_vencer");
  });
  it("el día 15 exacto todavía no está vencida", () => {
    expect(estadoPlazo(fecha, null, hoy("2026-11-16"))).toBe("por_vencer");
  });
  it("vencida al día siguiente del límite", () => {
    expect(estadoPlazo(fecha, null, hoy("2026-11-17"))).toBe("vencida");
  });
  it("respondida a tiempo, incluido el día 15 exacto", () => {
    expect(estadoPlazo(fecha, f("2026-11-05"), hoy("2026-12-30"))).toBe("respondida_a_tiempo");
    expect(estadoPlazo(fecha, f("2026-11-16"), hoy("2026-12-30"))).toBe("respondida_a_tiempo");
  });
  it("respondida tarde un día después", () => {
    expect(estadoPlazo(fecha, f("2026-11-17"), hoy("2026-12-30"))).toBe("respondida_tarde");
  });
  it("usa el día de Bogotá: 11 p. m. del día 16 aún cuenta como día 16", () => {
    expect(estadoPlazo(fecha, null, new Date("2026-11-17T03:30:00.000Z"))).toBe("por_vencer");
  });
});
