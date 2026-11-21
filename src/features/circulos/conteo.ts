import { claveDeSoloFecha } from "@/lib/fechas";

/**
 * Cuenta los círculos realizados desde el inicio de la línea base ('YYYY-MM-DD').
 * Recibe las fechas de las actas (columnas `@db.Date`). Sin línea base, cuenta todas.
 */
export function contarCirculos(fechas: Date[], lineaBaseInicio?: string | null): number {
  if (!lineaBaseInicio) return fechas.length;
  return fechas.filter((f) => claveDeSoloFecha(f) >= lineaBaseInicio).length;
}
