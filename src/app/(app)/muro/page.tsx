import { Card, Chip, EmptyState, PageHeader, ButtonLink, type TonoChip } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { mensajeInsuficienteCorto } from "@/lib/privacidad";
import { formatoCorto } from "@/lib/fechas";
import { ESTADO_SUGERENCIA, CATEGORIA_SUGERENCIA } from "@/lib/labels";
import { listarMuro, resumenMuro } from "@/features/buzon/queries";

export const metadata = { title: "Propusiste / Hicimos" };
export const dynamic = "force-dynamic";

const TONO: Record<string, TonoChip> = { IMPLEMENTADA: "verde", EN_REVISION: "amarillo", NO_IMPLEMENTADA: "neutro", RECIBIDA: "neutro" };

export default async function Page() {
  await requireRole("equipo");
  const [tarjetas, resumen] = await Promise.all([listarMuro(), resumenMuro()]);
  return (
    <>
      <PageHeader titulo="Propusiste / Hicimos" subtitulo="Lo que propusieron y lo que hicimos con eso." />
      <p className="mb-5 rounded-xl2 bg-arena p-3 text-base font-medium" aria-live="polite">
        {resumen.suficiente
          ? `${resumen.valor.recibidas} propuestas recibidas · ${resumen.valor.aTiempo} respondidas a tiempo`
          : `Datos insuficientes para proteger el anonimato (${mensajeInsuficienteCorto(resumen.minimo)})`}
      </p>
      {tarjetas.length === 0 ? (
        <EmptyState
          titulo="Aquí aparecerá lo que hagamos con tus ideas"
          descripcion="Todavía no hay propuestas respondidas. Tu idea puede ser la primera."
          accion={<ButtonLink href="/buzon">Proponer una mejora</ButtonLink>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {tarjetas.map((t) => (
            <li key={t.id}>
              <Card className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tono={TONO[t.estado]}>{ESTADO_SUGERENCIA[t.estado]}</Chip>
                  <Chip>{CATEGORIA_SUGERENCIA[t.categoria]}</Chip>
                  {t.respondidaEn && (
                    <span className="text-sm text-texto-suave">Respondida el {formatoCorto(t.respondidaEn, { soloFecha: true })}</span>
                  )}
                </div>
                <p>
                  <span className="font-semibold text-primario-osc">Propusiste: </span>
                  {t.resumenPublico}
                </p>
                <p>
                  <span className="font-semibold text-primario-osc">Hicimos: </span>
                  {t.respuesta}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
