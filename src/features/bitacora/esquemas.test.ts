import { describe, expect, it } from "vitest";
import { claveDia, sumarDias } from "@/lib/fechas";
import { esquemaAbrir, esquemaCerrar, esquemaRevertida, esquemaResuelta } from "./esquemas";

const hoy = claveDia(Date.now());
const hace = (d: number) => claveDia(sumarDias(new Date(), -d));
const mensaje = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

describe("esquemaAbrir", () => {
  it("acepta los tres campos", () => {
    expect(esquemaAbrir.safeParse({ quienConsulta: "CABINA", tipo: "AGENDA", dirigidaA: "PROPIETARIA" }).success).toBe(true);
  });
  it("rechaza valores desconocidos y campos faltantes", () => {
    expect(esquemaAbrir.safeParse({ quienConsulta: "JEFA", tipo: "AGENDA", dirigidaA: "PROPIETARIA" }).success).toBe(false);
    expect(esquemaAbrir.safeParse({ quienConsulta: "CABINA", tipo: "AGENDA" }).success).toBe(false);
  });
});

describe("esquemaCerrar", () => {
  const base = { id: "c1", recibioRespuesta: "true", decidio: "ROL_DELEGADO", escalada: "false" };
  it("acepta strings de FormData y convierte a booleano", () => {
    const r = esquemaCerrar.safeParse(base);
    expect(r.success && r.data.recibioRespuesta).toBe(true);
    expect(r.success && r.data.escalada).toBe(false);
  });
  it("el motivo es obligatorio si se escaló", () => {
    const r = esquemaCerrar.safeParse({ ...base, escalada: "true" });
    expect(r.success).toBe(false);
    expect(mensaje(r)).toMatch(/por qué se escaló/);
    expect(esquemaCerrar.safeParse({ ...base, escalada: "true", motivoEscalamiento: "OTRO" }).success).toBe(true);
  });
  it("descarta el motivo si no se escaló", () => {
    const r = esquemaCerrar.safeParse({ ...base, motivoEscalamiento: "OTRO" });
    expect(r.success && r.data.motivoEscalamiento).toBeUndefined();
  });
  it("pide responder sí/no y quién decidió", () => {
    expect(esquemaCerrar.safeParse({ ...base, recibioRespuesta: undefined }).success).toBe(false);
    expect(esquemaCerrar.safeParse({ ...base, decidio: "" }).success).toBe(false);
  });
});

describe("esquemaResuelta", () => {
  const base = {
    quienConsulta: "RECEPCION", tipo: "AGENDA", dirigidaA: "ADMINISTRADORA", fecha: hace(3),
    recibioRespuesta: "true", tiempoRespuesta: "MISMO_DIA", decidio: "ROL_DELEGADO", escalada: "false",
  };
  it("acepta una consulta válida", () => expect(esquemaResuelta.safeParse(base).success).toBe(true));
  it("acepta hoy y hace 14 días, rechaza hace 15 y el futuro", () => {
    expect(esquemaResuelta.safeParse({ ...base, fecha: hoy }).success).toBe(true);
    expect(esquemaResuelta.safeParse({ ...base, fecha: hace(14) }).success).toBe(true);
    expect(esquemaResuelta.safeParse({ ...base, fecha: hace(15) }).success).toBe(false);
    expect(esquemaResuelta.safeParse({ ...base, fecha: claveDia(sumarDias(new Date(), 2)) }).success).toBe(false);
  });
  it("rechaza fechas mal escritas", () => expect(esquemaResuelta.safeParse({ ...base, fecha: "ayer" }).success).toBe(false));
  it("el motivo es obligatorio si se escaló", () => {
    expect(esquemaResuelta.safeParse({ ...base, escalada: "true" }).success).toBe(false);
    expect(esquemaResuelta.safeParse({ ...base, escalada: "true", motivoEscalamiento: "NO_CORRESPONDIA" }).success).toBe(true);
  });
  it("el tiempo debe ser coherente con haber recibido respuesta", () => {
    expect(esquemaResuelta.safeParse({ ...base, recibioRespuesta: "false" }).success).toBe(false);
    expect(esquemaResuelta.safeParse({ ...base, tiempoRespuesta: "SIN_RESPUESTA" }).success).toBe(false);
    expect(esquemaResuelta.safeParse({ ...base, recibioRespuesta: "false", tiempoRespuesta: "SIN_RESPUESTA" }).success).toBe(true);
  });
});

describe("esquemaRevertida", () => {
  it("pide quién la revirtió", () => {
    expect(esquemaRevertida.safeParse({ id: "c1" }).success).toBe(false);
    expect(esquemaRevertida.safeParse({ id: "c1", revertidaPor: "PROPIETARIA" }).success).toBe(true);
  });
});
