import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { registrarIntento, verificarCodigo } from "./auth";
import { firmarSesion, verificarSesion } from "./sesion-token";

describe("auth", () => {
  beforeEach(() => {
    process.env.TEAM_CODE = "2026";
    process.env.ADMIN_CODE = "renacer-gestion";
  });

  it("verifica códigos", () => {
    expect(verificarCodigo("2026")).toBe("equipo");
    expect(verificarCodigo(" renacer-gestion ")).toBe("gestion");
    expect(verificarCodigo("2027")).toBeNull();
    expect(verificarCodigo("")).toBeNull();
  });

  it("un código vacío en el entorno nunca da acceso", () => {
    process.env.TEAM_CODE = "";
    expect(verificarCodigo("")).toBeNull();
  });

  it("firma y verifica la sesión", async () => {
    const token = await firmarSesion("gestion");
    expect(await verificarSesion(token)).toEqual({ rol: "gestion" });
    expect(await verificarSesion(token + "x")).toBeNull();
    expect(await verificarSesion(undefined)).toBeNull();
  });

  it("limita a 5 intentos cada 10 minutos", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) expect(registrarIntento("ip-prueba", t0 + i).permitido).toBe(true);
    expect(registrarIntento("ip-prueba", t0 + 10).permitido).toBe(false);
    expect(registrarIntento("ip-prueba", t0 + 10 * 60 * 1000 + 5).permitido).toBe(true);
  });
});
