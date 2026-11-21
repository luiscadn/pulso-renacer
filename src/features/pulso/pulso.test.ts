import { describe, expect, it } from "vitest";
import { semanaISO } from "@/lib/fechas";
import { esquemaPulso, esquemaPulsoRoles } from "./esquemas";
import { cookiePulso, cookiePulsoRoles, proximoLunes } from "./semana";

const completo = { p1: "5", p2: "4", p3: "3", p4: "2", p5: "1", p6: "4" };

describe("esquemaPulso", () => {
  it("acepta valores 1–5 (strings de FormData) y los convierte a número", () => {
    expect(esquemaPulso.parse(completo)).toEqual({ p1: 5, p2: 4, p3: 3, p4: 2, p5: 1, p6: 4 });
  });
  it("exige las seis respuestas", () => {
    const { p6: _omitida, ...incompleto } = completo;
    void _omitida;
    expect(esquemaPulso.safeParse(incompleto).success).toBe(false);
  });
  it("rechaza fuera de rango, decimales y vacíos", () => {
    expect(esquemaPulso.safeParse({ ...completo, p1: "0" }).success).toBe(false);
    expect(esquemaPulso.safeParse({ ...completo, p1: "6" }).success).toBe(false);
    expect(esquemaPulso.safeParse({ ...completo, p2: "3.5" }).success).toBe(false);
    expect(esquemaPulso.safeParse({ ...completo, p3: "x" }).success).toBe(false);
  });
  it("no deja pasar campos que identifiquen (se descartan)", () => {
    expect(Object.keys(esquemaPulso.parse({ ...completo, nombre: "Ana" }))).toEqual(["p1", "p2", "p3", "p4", "p5", "p6"]);
  });
});

describe("esquemaPulsoRoles", () => {
  it("valida p7 entre 1 y 5", () => {
    expect(esquemaPulsoRoles.parse({ p7: "4" })).toEqual({ p7: 4 });
    expect(esquemaPulsoRoles.safeParse({ p7: "9" }).success).toBe(false);
    expect(esquemaPulsoRoles.safeParse({}).success).toBe(false);
  });
});

describe("semana del pulso (Bogotá)", () => {
  it("usa la semana ISO de Bogotá, no la de UTC, en el borde de año", () => {
    // 4 ene 2027 03:00 UTC = domingo 3 ene 22:00 en Bogotá → todavía semana 53 de 2026
    expect(semanaISO(new Date("2027-01-04T03:00:00Z"))).toBe("2026-W53");
    expect(semanaISO(new Date("2027-01-04T06:00:00Z"))).toBe("2027-W01");
    expect(semanaISO(new Date("2024-12-30T12:00:00Z"))).toBe("2025-W01");
  });
  it("los nombres de cookie dependen de la semana", () => {
    expect(cookiePulso("2026-W48")).toBe("pr_pulso_2026-W48");
    expect(cookiePulsoRoles("2026-W48")).toBe("pr_pulso_roles_2026-W48");
  });
  it("calcula el próximo lunes", () => {
    expect(proximoLunes(new Date("2026-11-21T20:00:00Z"))).toBe("2026-11-23"); // sábado → lunes
    expect(proximoLunes(new Date("2026-11-23T15:00:00Z"))).toBe("2026-11-30"); // lunes → siguiente lunes
    expect(proximoLunes(new Date("2026-11-23T03:00:00Z"))).toBe("2026-11-23"); // aún domingo en Bogotá
    expect(proximoLunes(new Date("2026-12-31T15:00:00Z"))).toBe("2027-01-04"); // cruce de año
  });
});
