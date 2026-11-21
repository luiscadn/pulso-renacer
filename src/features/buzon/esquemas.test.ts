import { describe, expect, it } from "vitest";
import { esquemaEnviar, esquemaResponder } from "./esquemas";

const base = { id: "x", estado: "EN_REVISION" as const };

describe("esquemaResponder", () => {
  it("no deja publicar sin resumen ni respuesta", () => {
    expect(esquemaResponder.safeParse({ ...base, publicada: "on" }).success).toBe(false);
    expect(esquemaResponder.safeParse({ ...base, publicada: "on", resumenPublico: "Algo" }).success).toBe(false);
    expect(esquemaResponder.safeParse({ ...base, publicada: "on", respuesta: "Hecho" }).success).toBe(false);
  });
  it("publica con resumen y respuesta", () => {
    expect(esquemaResponder.safeParse({ ...base, publicada: "on", resumenPublico: "Algo", respuesta: "Hecho" }).success).toBe(true);
  });
  it("guarda sin publicar sin exigir nada más", () => {
    expect(esquemaResponder.safeParse({ ...base, publicada: "", resumenPublico: "", respuesta: "" }).success).toBe(true);
  });
  it("exige respuesta si el estado es final", () => {
    expect(esquemaResponder.safeParse({ ...base, estado: "IMPLEMENTADA" }).success).toBe(false);
  });
});

describe("esquemaEnviar", () => {
  const ok = { categoria: "CABINA", texto: "Una idea para mejorar la cabina." };
  it("limita la firma a 80 caracteres", () => {
    expect(esquemaEnviar.safeParse({ ...ok, firmar: "on", firma: "a".repeat(80) }).success).toBe(true);
    expect(esquemaEnviar.safeParse({ ...ok, firmar: "on", firma: "a".repeat(81) }).success).toBe(false);
  });
  it("pide nombre si se activa la firma", () => {
    expect(esquemaEnviar.safeParse({ ...ok, firmar: "on", firma: "" }).success).toBe(false);
  });
  it("limita el texto a 800", () => {
    expect(esquemaEnviar.safeParse({ ...ok, texto: "a".repeat(801) }).success).toBe(false);
  });
});
