import { describe, expect, it, vi } from "vitest";

vi.mock("./ajustes", () => ({ leerAjuste: vi.fn(async () => null) }));

import { leerAjuste } from "./ajustes";
import { MENSAJE_INSUFICIENTE, mensajeInsuficienteCorto, protegido, umbral, UMBRAL_POR_DEFECTO } from "./privacidad";

describe("privacidad", () => {
  it("no calcula si n < umbral", () => {
    const calcular = vi.fn(() => 4.2);
    expect(protegido(2, calcular, 3)).toEqual({ suficiente: false, n: 2 });
    expect(calcular).not.toHaveBeenCalled();
  });

  it("calcula si n alcanza el umbral", () => {
    expect(protegido(3, () => 4.2, 3)).toEqual({ suficiente: true, n: 3, valor: 4.2 });
  });

  it("n = 0 nunca es suficiente", () => {
    expect(protegido(0, () => 1).suficiente).toBe(false);
  });

  it("umbral por defecto es 3", async () => {
    expect(UMBRAL_POR_DEFECTO).toBe(3);
    expect(await umbral()).toBe(3);
  });

  it("umbral lee el ajuste y descarta valores inválidos", async () => {
    vi.mocked(leerAjuste).mockResolvedValueOnce("5");
    expect(await umbral()).toBe(5);
    vi.mocked(leerAjuste).mockResolvedValueOnce("abc");
    expect(await umbral()).toBe(3);
    vi.mocked(leerAjuste).mockResolvedValueOnce("0");
    expect(await umbral()).toBe(3);
  });

  it("mensajes", () => {
    expect(MENSAJE_INSUFICIENTE).toBe("Datos insuficientes para proteger el anonimato");
    expect(mensajeInsuficienteCorto(3)).toBe("Datos insuficientes (n < 3)");
  });
});
