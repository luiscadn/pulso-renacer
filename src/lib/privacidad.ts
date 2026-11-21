import { leerAjuste } from "./ajustes";

export const UMBRAL_POR_DEFECTO = 3;
export const MENSAJE_INSUFICIENTE = "Datos insuficientes para proteger el anonimato";

export type Protegido<T> = { suficiente: false; n: number } | { suficiente: true; n: number; valor: T };

/** Umbral de anonimato configurado en Ajustes (3 por defecto). */
export async function umbral(): Promise<number> {
  const valor = Number.parseInt((await leerAjuste("umbralAnonimato")) ?? "", 10);
  return Number.isFinite(valor) && valor > 0 ? valor : UMBRAL_POR_DEFECTO;
}

/** Solo calcula (y muestra) el valor si n alcanza el umbral. */
export function protegido<T>(n: number, calcular: () => T, umbralMinimo: number = UMBRAL_POR_DEFECTO): Protegido<T> {
  if (n < umbralMinimo) return { suficiente: false, n };
  return { suficiente: true, n, valor: calcular() };
}

/** Texto corto para tarjetas: «Datos insuficientes (n < 3)». */
export function mensajeInsuficienteCorto(umbralMinimo: number = UMBRAL_POR_DEFECTO): string {
  return `Datos insuficientes (n < ${umbralMinimo})`;
}
