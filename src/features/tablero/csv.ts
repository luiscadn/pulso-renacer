/** CSV para Excel: UTF-8 con BOM, comillas dobles, saltos CRLF y protección contra fórmulas. Puro. */
export const BOM = "﻿";

export type Celda = string | number | boolean | Date | null | undefined;

/** Evita que Excel interprete texto como fórmula (=, +, -, @, tab, retorno). */
function escapar(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) && !/^-?\d+([.,]\d+)?$/.test(valor) ? `'${valor}` : valor;
  return /[",\r\n;]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

export function celdaATexto(c: Celda): string {
  if (c === null || c === undefined) return "";
  if (typeof c === "boolean") return c ? "Sí" : "No";
  if (c instanceof Date) return c.toISOString();
  return String(c);
}

export function aCsv(cabeceras: string[], filas: Celda[][]): string {
  const lineas = [cabeceras, ...filas].map((f) => f.map((c) => escapar(celdaATexto(c))).join(","));
  return BOM + lineas.join("\r\n") + "\r\n";
}
