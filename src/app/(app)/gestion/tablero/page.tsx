import { Download } from "lucide-react";
import { Banner, ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { claveDia } from "@/lib/fechas";
import { BotonImprimir } from "@/features/tablero/components/BotonImprimir";
import { SelectorPeriodo } from "@/features/tablero/components/SelectorPeriodo";
import { TarjetaIndicador } from "@/features/tablero/components/TarjetaIndicador";
import { resumen } from "@/features/tablero/metricas";
import { leerTablero } from "@/features/tablero/queries";

export const metadata = { title: "Tablero de indicadores" };
export const dynamic = "force-dynamic";

const OBJETIVOS = [
  { id: "O1", titulo: "O1 · Conducto regular efectivo" },
  { id: "O2", titulo: "O2 · Información operativa" },
  { id: "O3", titulo: "O3 · Sincronía, escucha y mediación" },
] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string; desde?: string; hasta?: string }> }) {
  await requireRole("gestion");
  const params = await searchParams;
  const { opcion, contexto, indicadores, tendencias } = await leerTablero(params);
  const r = resumen(indicadores);
  const consulta = new URLSearchParams(opcion === "rango" ? { p: "rango", desde: contexto.periodo.desde, hasta: contexto.periodo.hasta } : { p: opcion });
  const sinNada = indicadores.every((i) => i.n === 0);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader titulo="Tablero de indicadores" subtitulo="Los indicadores de la estrategia, calculados solos." />
      <SelectorPeriodo opcion={opcion} periodo={contexto.periodo} hoy={claveDia(contexto.hoy)} />
      <p className="text-sm text-texto-suave">
        Periodo: {contexto.periodo.desde} al {contexto.periodo.hasta} · Línea base: {contexto.lineaBase.desde} al {contexto.lineaBase.hasta}
      </p>
      <section aria-label="Resumen" className="rounded-xl2 bg-arena p-4">
        <p className="font-serif text-xl font-semibold">
          {r.cumplen} de {r.total} indicadores cumplen · {r.enCamino} en camino
        </p>
        <p className="mt-1 text-sm text-texto-suave">
          {r.noCumplen} no cumplen todavía · {r.insuficientes} con datos insuficientes
        </p>
        <div className="no-imprimir mt-3 flex flex-wrap gap-2">
          <ButtonLink href={`/gestion/tablero/imprimir?${consulta}`} variante="secundario">Versión para imprimir</ButtonLink>
          <BotonImprimir />
          <ButtonLink href="/gestion/exportar" variante="secundario" icono={<Download aria-hidden className="size-5" />}>Exportar</ButtonLink>
        </div>
      </section>
      <Banner>Ningún dato se muestra si viene de menos de {contexto.umbral} registros, para proteger el anonimato.</Banner>
      {sinNada && (
        <EmptyState
          titulo="Todavía no hay registros en este periodo"
          descripcion="Cuando el equipo use la bitácora, el semáforo y el pulso, los indicadores aparecerán aquí. Prueba con 30 días o revisa Ajustes."
          accion={<ButtonLink href="/gestion/ajustes" variante="secundario">Ir a Ajustes</ButtonLink>}
        />
      )}
      {OBJETIVOS.map((o) => (
        <section key={o.id} aria-labelledby={`h-${o.id}`} className="flex flex-col gap-3">
          <h2 id={`h-${o.id}`} className="text-xl font-semibold">{o.titulo}</h2>
          <div className="grid gap-3">
            {indicadores
              .filter((i) => i.objetivo === o.id)
              .map((i) => (
                <TarjetaIndicador
                  key={i.id}
                  indicador={i}
                  umbral={contexto.umbral}
                  tendencia={i.id === "I1" || i.id === "I2" || i.id === "I12" ? tendencias[i.id] : undefined}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
