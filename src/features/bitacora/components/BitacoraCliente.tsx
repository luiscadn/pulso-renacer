"use client";
import { useState } from "react";
import { Banner, cn } from "@/components/ui";
import type { ConsultaVista } from "../queries";
import { FormResuelta } from "./FormResuelta";
import { ListaAbiertas } from "./ListaAbiertas";
import { ListaRecientes } from "./ListaRecientes";
import { NuevaConsulta } from "./NuevaConsulta";

type Pestana = "abiertas" | "nueva" | "resuelta" | "recientes";

export function BitacoraCliente({ abiertas, recientes }: { abiertas: ConsultaVista[]; recientes: ConsultaVista[] }) {
  const [pestana, setPestana] = useState<Pestana>("abiertas");
  const pestanas: { id: Pestana; etiqueta: string }[] = [
    { id: "abiertas", etiqueta: abiertas.length ? `Abiertas (${abiertas.length})` : "Abiertas" },
    { id: "nueva", etiqueta: "Nueva" },
    { id: "resuelta", etiqueta: "Ya resuelta" },
    { id: "recientes", etiqueta: "Recientes" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <Banner tipo="aviso">No escribas nombres de pacientes ni de compañeras. Aquí solo se registran roles.</Banner>
      <div role="tablist" aria-label="Secciones de la bitácora" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={pestana === p.id}
            aria-controls="panel-bitacora"
            onClick={() => setPestana(p.id)}
            className={cn(
              "min-h-11 rounded-xl2 border px-3 text-base font-semibold transition-colors",
              pestana === p.id ? "border-primario-osc bg-primario-osc text-white" : "border-borde bg-white text-texto hover:bg-arena",
            )}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="panel-bitacora" aria-labelledby={`tab-${pestana}`}>
        {pestana === "abiertas" && <ListaAbiertas consultas={abiertas} alNueva={() => setPestana("nueva")} />}
        {pestana === "nueva" && <NuevaConsulta alVerAbiertas={() => setPestana("abiertas")} />}
        {pestana === "resuelta" && <FormResuelta />}
        {pestana === "recientes" && <ListaRecientes consultas={recientes} />}
      </div>
    </div>
  );
}
