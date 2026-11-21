import { describe, expect, it } from "vitest";
import {
  claveDia,
  diasRestantes,
  fechaLimiteSugerencia,
  formatoCorto,
  formatoHora,
  formatoRelativo,
  horasEntre,
  inicioDiaBogota,
  mismoDiaBogota,
  semanaISO,
  soloFecha,
  sumarDias,
} from "./fechas";

describe("fechas en Bogotá", () => {
  it("el proceso de prueba corre en UTC, como Render", () => {
    expect(new Date("2026-01-01T00:00:00Z").getTimezoneOffset()).toBe(0);
  });

  it("borde de medianoche: 23:30 en Bogotá ya es el día siguiente en UTC", () => {
    const noche = new Date("2026-11-22T04:30:00Z"); // 21 nov, 11:30 p. m. en Bogotá
    expect(claveDia(noche)).toBe("2026-11-21");
    expect(soloFecha(noche).toISOString()).toBe("2026-11-21T00:00:00.000Z");
    const madrugada = new Date("2026-11-22T05:30:00Z"); // 22 nov, 12:30 a. m. en Bogotá
    expect(claveDia(madrugada)).toBe("2026-11-22");
    expect(mismoDiaBogota(noche, madrugada)).toBe(false);
  });

  it("mismo día en Bogotá aunque en UTC sean días distintos", () => {
    const tarde = new Date("2026-11-21T20:00:00Z"); // 3:00 p. m.
    const noche = new Date("2026-11-22T04:00:00Z"); // 11:00 p. m.
    expect(mismoDiaBogota(tarde, noche)).toBe(true);
  });

  it("inicioDiaBogota devuelve las 05:00 UTC", () => {
    expect(inicioDiaBogota(new Date("2026-11-22T03:00:00Z")).toISOString()).toBe("2026-11-21T05:00:00.000Z");
  });

  it("semanaISO usa la semana de Bogotá", () => {
    expect(semanaISO(new Date("2026-11-25T15:00:00Z"))).toBe("2026-W48");
    // Domingo 29 nov 11 p. m. en Bogotá (lunes en UTC) sigue siendo la W48
    expect(semanaISO(new Date("2026-11-30T04:00:00Z"))).toBe("2026-W48");
    expect(semanaISO(new Date("2026-11-30T05:00:00Z"))).toBe("2026-W49");
    expect(semanaISO(new Date("2021-01-03T15:00:00Z"))).toBe("2020-W53");
  });

  it("sumarDias y horasEntre", () => {
    const a = new Date("2026-11-21T12:00:00Z");
    expect(sumarDias(a, 3).toISOString()).toBe("2026-11-24T12:00:00.000Z");
    expect(horasEntre(a, new Date("2026-11-22T00:30:00Z"))).toBe(12.5);
  });

  it("formatos en español", () => {
    const d = new Date("2026-11-21T20:00:00Z");
    expect(formatoCorto(d)).toBe("21 nov 2026");
    expect(formatoCorto(new Date("2026-11-21T00:00:00Z"), { soloFecha: true })).toBe("21 nov 2026");
    expect(formatoHora(d)).toBe("3:00 p. m.");
    expect(formatoHora(new Date("2026-11-21T14:05:00Z"))).toBe("9:05 a. m.");
    const ahora = new Date("2026-11-21T22:00:00Z");
    expect(formatoRelativo(d, ahora)).toBe("hace 2 h");
    expect(formatoRelativo(new Date("2026-11-21T21:55:00Z"), ahora)).toBe("hace 5 min");
    expect(formatoRelativo(new Date("2026-11-18T21:00:00Z"), ahora)).toBe("hace 3 días");
  });

  it("fecha límite de sugerencia = +15 días y días restantes", () => {
    const fecha = new Date("2026-11-01T00:00:00Z");
    expect(fechaLimiteSugerencia(fecha).toISOString()).toBe("2026-11-16T00:00:00.000Z");
    // 15 nov 11 p. m. en Bogotá: falta 1 día
    expect(diasRestantes(fechaLimiteSugerencia(fecha), new Date("2026-11-16T04:00:00Z"))).toBe(1);
    expect(diasRestantes(fechaLimiteSugerencia(fecha), new Date("2026-11-17T15:00:00Z"))).toBe(-1);
  });
});
