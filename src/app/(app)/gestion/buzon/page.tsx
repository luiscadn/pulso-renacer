import Link from "next/link";
import { Card, Chip, Countdown, EmptyState, FormStatus, PageHeader, type TonoChip } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatoCorto } from "@/lib/fechas";
import { CATEGORIA_SUGERENCIA, ESTADO_SUGERENCIA } from "@/lib/labels";
import { EditorSugerencia } from "@/features/buzon/components/EditorSugerencia";
import { listarBandeja, type FiltroBuzon } from "@/features/buzon/queries";
import type { EstadoPlazo } from "@/features/buzon/plazo";

export const metadata = { title: "Bandeja del buzón" };
export const dynamic = "force-dynamic";

const FILTROS: { clave: FiltroBuzon; etiqueta: string }[] = [
  { clave: "pendientes", etiqueta: "Pendientes" },
  { clave: "vencidas", etiqueta: "Vencidas" },
  { clave: "respondidas", etiqueta: "Respondidas" },
  { clave: "todas", etiqueta: "Todas" },
];

const CHIP_RESPONDIDA: Partial<Record<EstadoPlazo, { tono: TonoChip; texto: string }>> = {
  respondida_a_tiempo: { tono: "verde", texto: "Respondida a tiempo" },
  respondida_tarde: { tono: "amarillo", texto: "Respondida tarde" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ f?: string; guardada?: string }> }) {
  await requireRole("gestion");
  const { f, guardada } = await searchParams;
  const filtro = FILTROS.find((x) => x.clave === f)?.clave ?? "pendientes";
  const { lista, cuentas } = await listarBandeja(filtro);
  return (
    <>
      <PageHeader titulo="Bandeja del buzón" subtitulo="Responde las propuestas antes de su fecha límite." />
      {guardada && <FormStatus estado="exito" mensaje="Listo, guardamos la respuesta." />}
      <nav aria-label="Filtros" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTROS.map((x) => (
          <Link
            key={x.clave}
            href={`/gestion/buzon?f=${x.clave}`}
            aria-current={x.clave === filtro ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center rounded-full border-2 px-4 text-base font-medium ${
              x.clave === filtro ? "border-primario-osc bg-primario-osc text-white" : "border-borde bg-white hover:border-primario"
            }`}
          >
            {x.etiqueta} ({cuentas[x.clave]})
          </Link>
        ))}
      </nav>
      {lista.length === 0 ? (
        <EmptyState titulo="Nada por aquí" descripcion="No hay propuestas en este filtro. Cuando lleguen nuevas, las verás en «Pendientes»." />
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((s) => {
            const resp = CHIP_RESPONDIDA[s.plazo];
            return (
              <li key={s.id}>
                <Card>
                  <details>
                    <summary className="flex min-h-11 cursor-pointer flex-col gap-2 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primario-osc">
                      <span className="line-clamp-2 text-base font-medium">{s.texto}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        {resp ? <Chip tono={resp.tono}>{resp.texto}</Chip> : <Countdown limite={s.limite} />}
                        <Chip>{CATEGORIA_SUGERENCIA[s.categoria]}</Chip>
                        <Chip>{ESTADO_SUGERENCIA[s.estado]}</Chip>
                        <span className="text-sm text-texto-suave">Recibida el {formatoCorto(s.fecha, { soloFecha: true })}</span>
                      </span>
                    </summary>
                    <div className="mt-4 border-t border-borde pt-4">
                      <EditorSugerencia
                        id={s.id}
                        texto={s.texto}
                        firma={s.firma}
                        estado={s.estado}
                        resumenPublico={s.resumenPublico}
                        respuesta={s.respuesta}
                        publicada={s.publicada}
                        filtro={filtro}
                      />
                    </div>
                  </details>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
