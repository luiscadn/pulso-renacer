import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Avisar retraso" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="Avisar retraso" subtitulo="Semáforo de agendas entre recepción y cabinas." />
      <EmptyState titulo="En construcción — agente mapa-semaforo" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
