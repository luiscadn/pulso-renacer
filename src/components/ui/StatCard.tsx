import type { ReactNode } from "react";
import { Chip, type TonoChip } from "./Chip";
import { cn } from "./cn";

export type EstadoIndicador = "cumple" | "en_camino" | "no_cumple" | "insuficiente";

const estados: Record<EstadoIndicador, { etiqueta: string; tono: TonoChip }> = {
  cumple: { etiqueta: "Cumple", tono: "verde" },
  en_camino: { etiqueta: "En camino", tono: "amarillo" },
  no_cumple: { etiqueta: "No cumple", tono: "rojo" },
  insuficiente: { etiqueta: "Datos insuficientes", tono: "neutro" },
};

type Props = {
  titulo: string;
  /** Valor en el periodo. Si el estado es «insuficiente», pasa el mensaje de anonimato. */
  valor: ReactNode;
  meta?: ReactNode;
  lineaBase?: ReactNode;
  estado?: EstadoIndicador;
  codigo?: string;
  detalle?: ReactNode;
  /** Slot para una gráfica pequeña (recharts) */
  grafica?: ReactNode;
  className?: string;
};

export function StatCard({ titulo, valor, meta, lineaBase, estado, codigo, detalle, grafica, className }: Props) {
  const e = estado ? estados[estado] : null;
  return (
    <article className={cn("flex flex-col gap-3 rounded-xl2 border-2 border-borde bg-white p-4 shadow-suave", className)}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold leading-snug">
          {codigo && <span className="mr-1 text-texto-suave">{codigo}</span>}
          {titulo}
        </h3>
        {e && <Chip tono={e.tono}>{e.etiqueta}</Chip>}
      </div>
      <p className={cn("font-serif font-semibold", estado === "insuficiente" ? "text-base text-texto-suave" : "text-3xl")}>{valor}</p>
      {(meta || lineaBase) && (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {lineaBase !== undefined && (
            <div>
              <dt className="text-texto-suave">Línea base</dt>
              <dd className="font-medium">{lineaBase}</dd>
            </div>
          )}
          {meta !== undefined && (
            <div>
              <dt className="text-texto-suave">Meta</dt>
              <dd className="font-medium">{meta}</dd>
            </div>
          )}
        </dl>
      )}
      {detalle && <div className="text-sm text-texto-suave">{detalle}</div>}
      {grafica && <div className="h-16">{grafica}</div>}
    </article>
  );
}
