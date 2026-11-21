/** Selección del periodo del tablero desde la URL. Lógica pura y en días de Bogotá. */
import { claveDia, fechaDesdeClave } from "@/lib/fechas";
import type { Rango } from "./metricas";

export type OpcionPeriodo = "14" | "30" | "rango";
export const MAX_DIAS_RANGO = 366;

const ES_CLAVE = /^\d{4}-\d{2}-\d{2}$/;

function claveValida(c: string | undefined): c is string {
  if (!c || !ES_CLAVE.test(c)) return false;
  const f = fechaDesdeClave(c);
  return !Number.isNaN(f.getTime()) && f.toISOString().slice(0, 10) === c;
}

function restarDias(clave: string, dias: number): string {
  return new Date(fechaDesdeClave(clave).getTime() - dias * 86_400_000).toISOString().slice(0, 10);
}

export function diasEnRango(r: Rango): number {
  return Math.round((fechaDesdeClave(r.hasta).getTime() - fechaDesdeClave(r.desde).getTime()) / 86_400_000) + 1;
}

export function resolverPeriodo(
  params: { p?: string; desde?: string; hasta?: string },
  hoy: Date,
): { opcion: OpcionPeriodo; periodo: Rango } {
  const hoyClave = claveDia(hoy);
  if (params.p === "30") return { opcion: "30", periodo: { desde: restarDias(hoyClave, 29), hasta: hoyClave } };
  if (params.p === "rango" && claveValida(params.desde) && claveValida(params.hasta)) {
    let [desde, hasta] = [params.desde, params.hasta];
    if (desde > hasta) [desde, hasta] = [hasta, desde];
    if (hasta > hoyClave) hasta = hoyClave;
    if (desde > hasta) desde = hasta;
    const minimo = restarDias(hasta, MAX_DIAS_RANGO - 1);
    if (desde < minimo) desde = minimo;
    return { opcion: "rango", periodo: { desde, hasta } };
  }
  return { opcion: "14", periodo: { desde: restarDias(hoyClave, 13), hasta: hoyClave } };
}

export function etiquetaPeriodo(r: Rango): string {
  return `${r.desde} al ${r.hasta}`;
}
