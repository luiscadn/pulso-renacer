"use client";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/** Hoja inferior accesible (usa <dialog>: atrapa el foco, se cierra con Esc). Los hijos se montan solo al abrir. */
export function Hoja({ abierta, onCerrar, titulo, children }: { abierta: boolean; onCerrar: () => void; titulo: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);
  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      aria-label={titulo}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-crema p-5 text-texto backdrop:bg-black/40 sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      {abierta && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold">{titulo}</h2>
            <button type="button" onClick={onCerrar} aria-label="Cerrar" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-arena">
              <X aria-hidden className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
