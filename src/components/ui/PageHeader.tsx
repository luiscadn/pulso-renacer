import type { ReactNode } from "react";

export function PageHeader({ titulo, subtitulo, accion }: { titulo: string; subtitulo?: ReactNode; accion?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col items-center gap-3 text-center">
      <div className="min-w-0">
        <h1 className="text-4xl leading-tight text-vino">{titulo}</h1>
        {subtitulo && <p className="mx-auto mt-1 max-w-md text-base text-texto-suave">{subtitulo}</p>}
      </div>
      {accion && <div>{accion}</div>}
    </header>
  );
}
