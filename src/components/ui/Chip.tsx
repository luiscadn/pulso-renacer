import type { ReactNode } from "react";
import { cn } from "./cn";

export type TonoChip = "neutro" | "verde" | "amarillo" | "rojo";

const tonos: Record<TonoChip, string> = {
  neutro: "bg-arena text-texto border-borde",
  verde: "bg-[#e3f1e7] text-verde-texto border-[#b9dcc4]",
  amarillo: "bg-[#fbf0d3] text-amarillo-texto border-[#efd58c]",
  rojo: "bg-[#f8e1de] text-rojo-texto border-[#ebb7b0]",
};

export function Chip({ tono = "neutro", children, className }: { tono?: TonoChip; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium whitespace-nowrap",
        tonos[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
