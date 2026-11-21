import { diasRestantes, fechaLimiteSugerencia, soloFecha } from "@/lib/fechas";

export type EstadoPlazo = "a_tiempo" | "por_vencer" | "vencida" | "respondida_a_tiempo" | "respondida_tarde";

/** Días que faltan (≤ este valor) para que el plazo se considere «por vencer». */
export const DIAS_POR_VENCER = 5;

/**
 * Estado del plazo de respuesta de una sugerencia (15 días desde `fecha`).
 * `fecha` y `respondidaEn` son valores `@db.Date`; `hoy` es un instante (se pasa a día de Bogotá).
 * El día 15 exacto todavía está a tiempo (vence cuando termina ese día).
 */
export function estadoPlazo(fecha: Date, respondidaEn: Date | null | undefined, hoy: Date = new Date()): EstadoPlazo {
  const limite = fechaLimiteSugerencia(fecha);
  if (respondidaEn) {
    return respondidaEn.getTime() <= limite.getTime() ? "respondida_a_tiempo" : "respondida_tarde";
  }
  const dias = diasRestantes(limite, hoy);
  if (dias < 0) return "vencida";
  if (dias <= DIAS_POR_VENCER) return "por_vencer";
  return "a_tiempo";
}

export function estaRespondida(estado: EstadoPlazo): boolean {
  return estado === "respondida_a_tiempo" || estado === "respondida_tarde";
}

export { soloFecha };
