import { CalendarClock, Users } from "lucide-react";
import { Chip, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { ActaCard } from "@/features/circulos/components/ActaCard";
import { listarActas, progresoCirculos } from "@/features/circulos/queries";

export const metadata = { title: "Círculos" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("equipo");
  const [actas, progreso] = await Promise.all([listarActas(), progresoCirculos()]);
  return (
    <>
      <PageHeader titulo="Círculos" subtitulo="Lo que hablamos y acordamos en cada círculo de bienestar." />
      <div className="mb-5 flex flex-col gap-2 rounded-xl2 border border-primario bg-arena p-4">
        <p className="flex items-start gap-2 text-base font-medium">
          <CalendarClock aria-hidden className="mt-0.5 size-5 shrink-0 text-primario-osc" />
          Próximo círculo: cada 15 días · 30 minutos · sin pacientes
        </p>
        <p className="flex items-center gap-2 text-base">
          <Users aria-hidden className="size-5 text-primario-osc" />
          <span>Círculos realizados:</span>
          <Chip tono={progreso.n >= progreso.meta ? "verde" : "neutro"}>
            {progreso.n} / {progreso.meta}
          </Chip>
        </p>
      </div>
      {actas.length === 0 ? (
        <EmptyState
          titulo="Aún no hay actas"
          descripcion="Cuando se haga el primer círculo, aquí verás qué funcionó, qué se trabó y qué acordamos."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {actas.map((a) => (
            <ActaCard key={a.id} acta={a} />
          ))}
        </div>
      )}
    </>
  );
}
