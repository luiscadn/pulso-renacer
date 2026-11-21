import { StatCard } from "@/components/ui";
import { textoBase, textoDetalle, textoValor } from "../formato";
import type { Indicador, PuntoTendencia } from "../metricas";
import { Tendencia } from "./Tendencia";

export function TarjetaIndicador({
  indicador: i,
  umbral,
  tendencia,
}: {
  indicador: Indicador;
  umbral: number;
  tendencia?: PuntoTendencia[];
}) {
  const detalle = (
    <div className="flex flex-col gap-2">
      <p>
        {i.formato === "fraccion" ? "Total" : "Registros (n)"}: <strong>{i.n}</strong>
      </p>
      {i.detalle && i.detalle.length > 0 && (
        <ul className="list-inside list-disc">
          {i.detalle.map((d) => (
            <li key={d.etiqueta}>
              {d.etiqueta}: <strong>{textoDetalle(d, umbral)}</strong>
            </li>
          ))}
        </ul>
      )}
      <details className="rounded-xl2 bg-arena px-3 py-2">
        <summary className="min-h-11 cursor-pointer py-2.5 font-medium text-texto">¿Cómo se calcula?</summary>
        <p className="pb-2 text-texto">{i.formula}</p>
      </details>
    </div>
  );
  return (
    <StatCard
      codigo={i.id}
      titulo={i.titulo}
      valor={textoValor(i, umbral)}
      lineaBase={textoBase(i)}
      meta={i.meta}
      estado={i.estado}
      detalle={detalle}
      grafica={tendencia ? <Tendencia puntos={tendencia} titulo={i.titulo} umbral={umbral} /> : undefined}
    />
  );
}
