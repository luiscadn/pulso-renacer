import type { TiempoRespuesta } from "@prisma/client";
import { horasEntre, mismoDiaBogota } from "@/lib/fechas";

/**
 * Tiempo de respuesta de una consulta (SPEC §6.3), calculado en hora de Bogotá:
 * sin respuesta → SIN_RESPUESTA; mismo día calendario → MISMO_DIA; menos de 24 h → MENOS_24H; si no → MAS_24H.
 */
export function calcularTiempoRespuesta(abiertaEn: Date, cerradaEn: Date, recibioRespuesta: boolean): TiempoRespuesta {
  if (!recibioRespuesta) return "SIN_RESPUESTA";
  if (mismoDiaBogota(abiertaEn, cerradaEn)) return "MISMO_DIA";
  if (horasEntre(abiertaEn, cerradaEn) < 24) return "MENOS_24H";
  return "MAS_24H";
}

/** Una consulta abierta lleva «más de 24 h» si pasaron 24 horas o más desde que se abrió. */
export function llevaMasDe24h(abiertaEn: Date, ahora: Date = new Date()): boolean {
  return horasEntre(abiertaEn, ahora) >= 24;
}

/** Los días hacia atrás que se permite registrar una consulta ya resuelta, y la ventana de «Recientes». */
export const DIAS_RESUELTA_MAX = 14;
export const DIAS_RECIENTES = 30;

/** Instante de las `hora`:00 en Bogotá (UTC−5, sin horario de verano) del día 'YYYY-MM-DD'. */
export function horaDeDiaBogota(clave: string, hora: number): Date {
  return new Date(`${clave}T${String(hora).padStart(2, "0")}:00:00-05:00`);
}
