import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Círculos" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="Círculos" subtitulo="Actas de los círculos quincenales de bienestar." />
      <EmptyState titulo="En construcción — agente pulso-circulos" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
