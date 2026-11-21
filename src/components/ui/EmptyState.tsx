import { Sprout } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ titulo, descripcion, accion, icono }: { titulo: string; descripcion?: ReactNode; accion?: ReactNode; icono?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-borde bg-white/60 px-6 py-10 text-center">
      <span aria-hidden className="text-primario">
        {icono ?? <Sprout className="size-10" />}
      </span>
      <p className="font-serif text-lg font-semibold">{titulo}</p>
      {descripcion && <div className="max-w-sm text-base text-texto-suave">{descripcion}</div>}
      {accion}
    </div>
  );
}
