import { db } from "./db";

export const CLAVES_AJUSTE = [
  "lineaBaseInicio",
  "lineaBaseFin",
  "umbralAnonimato",
  "metaCirculos",
  "cabinas",
  "kitCabinasActualizadas",
  "kitCabinasTotal",
] as const;
export type ClaveAjuste = (typeof CLAVES_AJUSTE)[number];

export async function leerAjuste(clave: ClaveAjuste): Promise<string | null> {
  const fila = await db.ajuste.findUnique({ where: { clave } });
  return fila?.valor ?? null;
}

export async function leerAjustes(): Promise<Partial<Record<ClaveAjuste, string>>> {
  const filas = await db.ajuste.findMany();
  return Object.fromEntries(filas.map((f) => [f.clave, f.valor])) as Partial<Record<ClaveAjuste, string>>;
}

export function separarCabinas(valor: string | null | undefined): string[] {
  return (valor ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export async function cabinas(): Promise<string[]> {
  return separarCabinas(await leerAjuste("cabinas"));
}
