"use client";
import { ChevronDown, Search, UserCheck, AlertTriangle, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, Chip, EmptyState, Input, cn } from "@/components/ui";
import { filtrarSituaciones } from "../logica";

type Tarjeta = {
  id: string;
  titulo: string;
  ejemplo: string;
  tipo: string;
  tipoEtiqueta: string;
  quienResuelve: string;
  tiempoEsperado: string;
  cuandoEscalar: string;
  comoHacerlo: string | null;
  porValidar: boolean;
};

export function BuscadorMapa({ tarjetas, tipos }: { tarjetas: Tarjeta[]; tipos: { valor: string; etiqueta: string }[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const visibles = useMemo(() => filtrarSituaciones(tarjetas, busqueda, tipo), [tarjetas, busqueda, tipo]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-texto-suave" />
        <Input
          type="search"
          aria-label="Buscar una situación"
          placeholder="Busca: descuento, turno, cabina…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-11"
        />
      </div>
      <div role="group" aria-label="Filtrar por tipo" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ valor: "", etiqueta: "Todas" }, ...tipos].map((t) => {
          const activo = (tipo ?? "") === t.valor;
          return (
            <button
              key={t.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => setTipo(t.valor || null)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-base font-medium focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primario-osc",
                activo ? "border-primario-osc bg-primario-osc text-white" : "border-borde bg-white text-texto hover:border-primario",
              )}
            >
              {t.etiqueta}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="text-sm text-texto-suave">
        {visibles.length === 1 ? "1 situación" : `${visibles.length} situaciones`}
      </p>
      {visibles.length === 0 ? (
        <EmptyState
          titulo="No encontramos ese caso"
          descripcion="Prueba con otras palabras o quita el filtro. Si sigue sin aparecer, registra la consulta en la bitácora."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {visibles.map((t) => {
            const abierto = abierta === t.id;
            const idPanel = `panel-${t.id}`;
            return (
              <li key={t.id}>
                <Card className="p-0">
                  <button
                    type="button"
                    aria-expanded={abierto}
                    aria-controls={idPanel}
                    onClick={() => setAbierta(abierto ? null : t.id)}
                    className="flex min-h-14 w-full items-start gap-3 rounded-xl2 p-4 text-left focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primario-osc"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <Chip>{t.tipoEtiqueta}</Chip>
                        {t.porValidar && <Chip tono="amarillo">Por validar</Chip>}
                      </span>
                      <span className="text-lg font-semibold leading-snug">{t.titulo}</span>
                      <span className="text-base text-texto-suave">{t.ejemplo}</span>
                      <span className="mt-1 flex items-center gap-2 text-base font-semibold text-primario-osc">
                        <UserCheck aria-hidden className="size-5 shrink-0" />
                        Resuelve: {t.quienResuelve}
                      </span>
                    </span>
                    <ChevronDown aria-hidden className={cn("mt-1 size-5 shrink-0 text-texto-suave transition-transform", abierto && "rotate-180")} />
                  </button>
                  {abierto && (
                    <div id={idPanel} className="flex flex-col gap-3 border-t border-borde p-4 text-base">
                      <p className="flex items-start gap-2">
                        <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-texto-suave" />
                        <span>
                          <strong>Tiempo esperado:</strong> {t.tiempoEsperado}
                        </span>
                      </p>
                      <div className="rounded-xl2 bg-[#fbf0d3] p-3 text-[#5c4304]">
                        <p className="flex items-start gap-2">
                          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
                          <span>
                            <strong>Escala a la propietaria cuando:</strong> {t.cuandoEscalar}
                          </span>
                        </p>
                      </div>
                      {t.comoHacerlo && (
                        <p>
                          <strong>Cómo hacerlo:</strong> {t.comoHacerlo}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
