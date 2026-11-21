"use client";
import { useState, useTransition } from "react";
import { Banner, Button, FormStatus } from "@/components/ui";
import { borrarDatosDemo, cargarDatosDemo } from "../actions";

type Estado = { tipo: "inactivo" | "exito" | "error"; mensaje?: string };

export function DatosDemo() {
  const [pendiente, iniciar] = useTransition();
  const [pidiendo, setPidiendo] = useState<null | "cargar" | "borrar">(null);
  const [estado, setEstado] = useState<Estado>({ tipo: "inactivo" });

  function confirmar() {
    const que = pidiendo;
    if (!que) return;
    iniciar(async () => {
      const r = await (que === "cargar" ? cargarDatosDemo : borrarDatosDemo)({ confirmar: "si" });
      setEstado(r.ok ? { tipo: "exito", mensaje: r.data.mensaje } : { tipo: "error", mensaje: r.error });
      setPidiendo(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Banner tipo="demo">Esta instancia está en modo demostración. Los datos de ejemplo están marcados y se pueden borrar.</Banner>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variante="secundario" onClick={() => setPidiendo("cargar")} disabled={pendiente}>Cargar datos de demostración</Button>
        <Button variante="secundario" onClick={() => setPidiendo("borrar")} disabled={pendiente}>Borrar datos de demostración</Button>
      </div>
      {pidiendo && (
        <div role="alertdialog" aria-labelledby="confirmar-titulo" className="flex flex-col gap-3 rounded-xl2 border border-borde bg-arena p-4">
          <p id="confirmar-titulo" className="font-medium">
            {pidiendo === "cargar"
              ? "Esto reemplaza los datos de demostración anteriores y mueve la línea base a las últimas 4 semanas. ¿Continuamos?"
              : "Esto borra solo los datos de demostración. Los registros reales no se tocan. ¿Continuamos?"}
          </p>
          <div className="flex gap-2">
            <Button variante={pidiendo === "borrar" ? "peligro" : "primario"} onClick={confirmar} cargando={pendiente}>Sí, continuar</Button>
            <Button variante="fantasma" onClick={() => setPidiendo(null)} disabled={pendiente}>Cancelar</Button>
          </div>
        </div>
      )}
      <FormStatus estado={pendiente ? "cargando" : estado.tipo} mensaje={pendiente ? "Trabajando… puede tardar unos segundos." : estado.mensaje} />
    </div>
  );
}
