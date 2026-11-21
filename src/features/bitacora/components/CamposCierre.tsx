"use client";
import { useState } from "react";
import { ChoiceCards } from "@/components/ui";
import { opcionesDecisor, opcionesMotivo, opcionesSiNo } from "./opciones";

/** Preguntas de cierre, compartidas por «Cerrar» y «Ya resuelta». Se leen con FormData. */
export function CamposCierre({ errores = {} }: { errores?: Record<string, string> }) {
  const [escalada, setEscalada] = useState<string | null>(null);
  return (
    <>
      <ChoiceCards name="recibioRespuesta" leyenda="¿Recibió respuesta?" opciones={opcionesSiNo} columnas={2} requerido error={errores.recibioRespuesta} />
      <ChoiceCards name="decidio" leyenda="¿Quién decidió finalmente?" opciones={opcionesDecisor} columnas={1} requerido error={errores.decidio} />
      <ChoiceCards
        name="escalada"
        leyenda="¿Se escaló a la propietaria?"
        opciones={opcionesSiNo}
        columnas={2}
        requerido
        onChange={setEscalada}
        error={errores.escalada}
      />
      {escalada === "true" && (
        <ChoiceCards name="motivoEscalamiento" leyenda="¿Por qué se escaló?" opciones={opcionesMotivo} requerido error={errores.motivoEscalamiento} />
      )}
    </>
  );
}
