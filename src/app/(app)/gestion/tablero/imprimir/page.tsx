import { ButtonLink } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatoCorto } from "@/lib/fechas";
import { BotonImprimir } from "@/features/tablero/components/BotonImprimir";
import { ESTADOS_TEXTO } from "@/features/tablero/estados";
import { textoBase, textoDetalle, textoValor } from "@/features/tablero/formato";
import { resumen } from "@/features/tablero/metricas";
import { leerTablero } from "@/features/tablero/queries";

export const metadata = { title: "Tablero para imprimir" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string; desde?: string; hasta?: string }> }) {
  await requireRole("gestion");
  const { contexto, indicadores } = await leerTablero(await searchParams);
  const r = resumen(indicadores);
  return (
    <div className="flex flex-col gap-4">
      <div className="no-imprimir flex flex-wrap gap-2">
        <BotonImprimir />
        <ButtonLink href="/gestion/tablero" variante="fantasma">Volver al tablero</ButtonLink>
      </div>
      <header>
        <h1 className="text-2xl font-semibold">Pulso Renacer · Indicadores de la estrategia</h1>
        <p className="text-sm">Generado el {formatoCorto(contexto.hoy)}</p>
        <p className="text-sm">Periodo: {contexto.periodo.desde} al {contexto.periodo.hasta}</p>
        <p className="text-sm">Línea base: {contexto.lineaBase.desde} al {contexto.lineaBase.hasta}</p>
        <p className="mt-1 font-medium">{r.cumplen} de {r.total} indicadores cumplen · {r.enCamino} en camino</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Indicadores I1 a I16</caption>
          <thead>
            <tr className="border-b-2 border-texto">
              <th scope="col" className="py-1 pr-2">Id</th>
              <th scope="col" className="py-1 pr-2">Indicador</th>
              <th scope="col" className="py-1 pr-2">Valor</th>
              <th scope="col" className="py-1 pr-2">Base</th>
              <th scope="col" className="py-1 pr-2">Meta</th>
              <th scope="col" className="py-1 pr-2">n</th>
              <th scope="col" className="py-1">Estado</th>
            </tr>
          </thead>
          <tbody>
            {indicadores.map((i) => (
              <tr key={i.id} className="break-inside-avoid border-b border-borde align-top">
                <th scope="row" className="py-1.5 pr-2 font-semibold">{i.id}</th>
                <td className="py-1.5 pr-2">
                  {i.titulo}
                  {i.detalle?.map((d) => (
                    <span key={d.etiqueta} className="block text-xs">{d.etiqueta}: {textoDetalle(d, contexto.umbral)}</span>
                  ))}
                </td>
                <td className="py-1.5 pr-2 font-medium">{textoValor(i, contexto.umbral)}</td>
                <td className="py-1.5 pr-2">{textoBase(i)}</td>
                <td className="py-1.5 pr-2">{i.meta}</td>
                <td className="py-1.5 pr-2">{i.n}</td>
                <td className="py-1.5">{ESTADOS_TEXTO[i.estado]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm">
        Regla de anonimato: ningún promedio, porcentaje o desglose se muestra si viene de menos de {contexto.umbral} registros. No se
        guardan nombres de pacientes ni de compañeras (Ley 1581 de 2012).
      </p>
    </div>
  );
}
