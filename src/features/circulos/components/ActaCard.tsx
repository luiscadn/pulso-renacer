import { Handshake, Hourglass, Scale, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { formatoCorto } from "@/lib/fechas";
import { APARTADOS_ACTA } from "../textos";

const ICONOS: Record<string, ReactNode> = {
  funciono: <Sparkles aria-hidden className="size-5" />,
  seTrabo: <Hourglass aria-hidden className="size-5" />,
  carga: <Scale aria-hidden className="size-5" />,
  acordamos: <Handshake aria-hidden className="size-5" />,
};

type Acta = { id: string; fecha: Date; funciono: string; seTrabo: string; carga: string; acordamos: string };

export function ActaCard({ acta, acciones }: { acta: Acta; acciones?: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold">Círculo del {formatoCorto(acta.fecha, { soloFecha: true })}</h2>
        {acciones}
      </header>
      <dl className="flex flex-col gap-3">
        {APARTADOS_ACTA.map((a) => (
          <div key={a.campo} className="flex gap-3">
            <span className="mt-0.5 text-primario-osc">{ICONOS[a.campo]}</span>
            <div className="min-w-0">
              <dt className="text-sm font-semibold text-texto-suave">{a.titulo}</dt>
              <dd className="text-base leading-relaxed break-words">{acta[a.campo]}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}
