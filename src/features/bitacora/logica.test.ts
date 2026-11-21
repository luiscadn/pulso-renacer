import { describe, expect, it } from "vitest";
import { calcularTiempoRespuesta, horaDeDiaBogota, llevaMasDe24h } from "./logica";

const t = (iso: string) => new Date(iso);

describe("calcularTiempoRespuesta", () => {
  it("sin respuesta siempre es SIN_RESPUESTA, aunque sea el mismo día", () => {
    expect(calcularTiempoRespuesta(t("2026-11-20T15:00:00-05:00"), t("2026-11-20T16:00:00-05:00"), false)).toBe("SIN_RESPUESTA");
    expect(calcularTiempoRespuesta(t("2026-11-18T15:00:00-05:00"), t("2026-11-20T16:00:00-05:00"), false)).toBe("SIN_RESPUESTA");
  });
  it("mismo día en Bogotá pero distinto día en UTC: 18:00 → 20:30", () => {
    const a = t("2026-11-20T18:00:00-05:00"); // 23:00 UTC
    const c = t("2026-11-20T20:30:00-05:00"); // 01:30 UTC del día siguiente
    expect(a.toISOString().slice(0, 10)).not.toBe(c.toISOString().slice(0, 10));
    expect(calcularTiempoRespuesta(a, c, true)).toBe("MISMO_DIA");
  });
  it("distinto día en Bogotá con solo 1 h de diferencia (11:30 p. m. → 12:30 a. m.)", () => {
    expect(calcularTiempoRespuesta(t("2026-11-20T23:30:00-05:00"), t("2026-11-21T00:30:00-05:00"), true)).toBe("MENOS_24H");
  });
  it("23 h 59 min en días distintos → MENOS_24H", () => {
    expect(calcularTiempoRespuesta(t("2026-11-20T10:00:00-05:00"), t("2026-11-21T09:59:00-05:00"), true)).toBe("MENOS_24H");
  });
  it("exactamente 24 h → MAS_24H", () => {
    expect(calcularTiempoRespuesta(t("2026-11-20T10:00:00-05:00"), t("2026-11-21T10:00:00-05:00"), true)).toBe("MAS_24H");
  });
  it("24 h 01 min → MAS_24H", () => {
    expect(calcularTiempoRespuesta(t("2026-11-20T10:00:00-05:00"), t("2026-11-21T10:01:00-05:00"), true)).toBe("MAS_24H");
  });
  it("varios días → MAS_24H", () => {
    expect(calcularTiempoRespuesta(t("2026-11-15T10:00:00-05:00"), t("2026-11-20T10:00:00-05:00"), true)).toBe("MAS_24H");
  });
  it("cerrada en el mismo instante → MISMO_DIA", () => {
    const a = t("2026-11-20T10:00:00-05:00");
    expect(calcularTiempoRespuesta(a, a, true)).toBe("MISMO_DIA");
  });
});

describe("llevaMasDe24h", () => {
  const abierta = t("2026-11-20T10:00:00-05:00");
  it("23 h 59 min no", () => expect(llevaMasDe24h(abierta, t("2026-11-21T09:59:00-05:00"))).toBe(false));
  it("24 h sí", () => expect(llevaMasDe24h(abierta, t("2026-11-21T10:00:00-05:00"))).toBe(true));
});

describe("horaDeDiaBogota", () => {
  it("mediodía de Bogotá es 17:00 UTC", () => expect(horaDeDiaBogota("2026-11-20", 12).toISOString()).toBe("2026-11-20T17:00:00.000Z"));
});
