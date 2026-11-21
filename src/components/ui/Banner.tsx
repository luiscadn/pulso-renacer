import { Info, TriangleAlert, FlaskConical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./cn";

export type TipoBanner = "info" | "aviso" | "demo";

const estilos: Record<TipoBanner, { clase: string; Icono: typeof Info }> = {
  info: { clase: "bg-arena border-borde text-texto", Icono: Info },
  aviso: { clase: "bg-[#fbf0d3] border-[#efd58c] text-[#5c4304]", Icono: TriangleAlert },
  demo: { clase: "bg-acento/25 border-acento text-texto", Icono: FlaskConical },
};

export function Banner({ tipo = "info", children, className }: { tipo?: TipoBanner; children: ReactNode; className?: string }) {
  const { clase, Icono } = estilos[tipo];
  return (
    <div role={tipo === "aviso" ? "alert" : "note"} className={cn("flex items-start gap-2 rounded-xl2 border p-3 text-sm", clase, className)}>
      <Icono aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
