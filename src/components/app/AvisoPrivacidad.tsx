"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { aceptarAvisoPrivacidad } from "./acciones-sesion";

/** Modal con el aviso de privacidad resumido. Se muestra hasta que se toca «Entendido». */
export function AvisoPrivacidad() {
  const ref = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(true);
  const [pendiente, iniciar] = useTransition();
  useEffect(() => {
    if (abierto && ref.current && !ref.current.open) ref.current.showModal();
  }, [abierto]);
  if (!abierto) return null;
  return (
    <dialog
      ref={ref}
      aria-labelledby="aviso-titulo"
      onCancel={(e) => e.preventDefault()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl2 bg-crema p-0 text-texto shadow-suave backdrop:bg-texto/40"
    >
      <div className="flex flex-col gap-4 p-5">
        <ShieldCheck aria-hidden className="size-10 text-primario-osc" />
        <h2 id="aviso-titulo" className="text-xl font-semibold">
          Tu privacidad primero
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-base">
          <li>Aquí no guardamos nombres de pacientes ni de compañeras, ni tu correo, ni tu IP.</li>
          <li>El pulso es anónimo y voluntario. Solo se ven resultados de grupo.</li>
          <li>Si hay menos de 3 respuestas, no se muestra ningún promedio.</li>
          <li>La propietaria ve solo datos agregados.</li>
        </ul>
        <p className="text-sm text-texto-suave">
          Lee el aviso completo en{" "}
          <Link href="/privacidad" className="font-medium text-primario-osc underline">
            Privacidad
          </Link>
          .
        </p>
        <Button
          tamano="lg"
          cargando={pendiente}
          onClick={() =>
            iniciar(async () => {
              await aceptarAvisoPrivacidad();
              ref.current?.close();
              setAbierto(false);
            })
          }
        >
          Entendido
        </Button>
      </div>
    </dialog>
  );
}
