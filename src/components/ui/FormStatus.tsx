import { CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "./cn";

/** Mensaje de estado de un formulario, anunciado por lectores de pantalla. */
export function FormStatus({
  estado,
  mensaje,
  className,
}: {
  estado: "inactivo" | "cargando" | "exito" | "error";
  mensaje?: string;
  className?: string;
}) {
  return (
    <div aria-live="polite" role="status" className={cn("min-h-6", className)}>
      {estado === "cargando" && <p className="text-base text-texto-suave">{mensaje ?? "Guardando…"}</p>}
      {estado === "exito" && mensaje && (
        <p className="flex items-start gap-2 rounded-xl2 bg-[#e3f1e7] p-3 text-base font-medium text-verde-texto">
          <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0" />
          {mensaje}
        </p>
      )}
      {estado === "error" && mensaje && (
        <p className="flex items-start gap-2 rounded-xl2 bg-[#f8e1de] p-3 text-base font-medium text-rojo-texto">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          {mensaje}
        </p>
      )}
    </div>
  );
}
