/** Formato de valores para mostrar (español colombiano: coma decimal). Puro. */
import { mensajeInsuficienteCorto } from "@/lib/privacidad";
import type { DetalleIndicador, FormatoIndicador, Indicador } from "./metricas";

const num = (v: number, dec: number) => v.toFixed(dec).replace(".", ",");

export function formatearValor(valor: number | null, formato: FormatoIndicador, total?: number): string {
  if (valor === null) return "—";
  switch (formato) {
    case "porcentaje": return `${num(valor, valor % 1 === 0 ? 0 : 1)} %`;
    case "promedio": return num(valor, 2);
    case "conteo": return String(valor);
    case "fraccion": return total !== undefined ? `${valor} de ${total}` : String(valor);
  }
}

/** Texto del valor de una tarjeta: el número o el aviso de anonimato. */
export function textoValor(i: Indicador, umbral: number): string {
  if (i.estado === "insuficiente" && i.valor === null) {
    return i.id === "I10" || i.id === "I15" ? "Sin configurar en Ajustes" : mensajeInsuficienteCorto(umbral);
  }
  return formatearValor(i.valor, i.formato, i.total);
}

export function textoBase(i: Indicador): string {
  if (i.formato === "fraccion") return "—";
  return formatearValor(i.valorBase, i.formato);
}

export function textoDetalle(d: DetalleIndicador, umbral: number): string {
  return d.valor === null ? mensajeInsuficienteCorto(umbral) : formatearValor(d.valor, d.formato);
}
