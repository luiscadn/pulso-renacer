"use client";
import { useState, useTransition } from "react";
import { Chip, Select } from "@/components/ui";
import { RESULTADO_MEDIACION } from "@/lib/labels";
import { actualizarMediacion } from "../actions";

const OPCIONES = Object.entries(RESULTADO_MEDIACION).map(([valor, etiqueta]) => ({ valor, etiqueta }));
type Resultado = keyof typeof RESULTADO_MEDIACION;

/** Una mediación: fecha, resultado editable y casilla de seguimiento a la semana. Sin texto libre. */
export function FilaMediacion({ id, fechaTexto, resultado, seguimientoHecho }: { id: string; fechaTexto: string; resultado: Resultado; seguimientoHecho: boolean }) {
  const [pendiente, empezar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<Resultado>(resultado);
  const [seg, setSeg] = useState(seguimientoHecho);

  function guardar(nuevoRes: Resultado, nuevoSeg: boolean) {
    const anterior = { res, seg };
    setRes(nuevoRes);
    setSeg(nuevoSeg);
    setError(null);
    empezar(async () => {
      const r = await actualizarMediacion({ id, resultado: nuevoRes, seguimientoHecho: nuevoSeg });
      if (!r.ok) {
        setError(r.error);
        setRes(anterior.res);
        setSeg(anterior.seg);
      }
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl2 border-2 border-borde bg-white p-4" aria-busy={pendiente}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{fechaTexto}</p>
        <Chip tono={res === "ACUERDO" ? "verde" : res === "EN_CURSO" ? "amarillo" : "rojo"}>{RESULTADO_MEDIACION[res]}</Chip>
      </div>
      <Select
        aria-label={`Resultado de la mediación del ${fechaTexto}`}
        value={res}
        opciones={OPCIONES}
        disabled={pendiente}
        onChange={(e) => guardar(e.target.value as Resultado, seg)}
      />
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
        <input
          type="checkbox"
          className="size-6 accent-[var(--primario-osc)]"
          checked={seg}
          disabled={pendiente}
          onChange={(e) => guardar(res, e.target.checked)}
        />
        Ya se hizo el seguimiento a la semana
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-rojo-texto">
          {error}
        </p>
      )}
    </li>
  );
}
