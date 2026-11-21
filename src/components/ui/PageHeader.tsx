import type { ReactNode } from "react";

export function PageHeader({ titulo, subtitulo, accion }: { titulo: string; subtitulo?: ReactNode; accion?: ReactNode }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold leading-tight text-texto">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-base text-texto-suave">{subtitulo}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </header>
  );
}
