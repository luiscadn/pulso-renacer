import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Proponer mejora" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="Proponer mejora" subtitulo="Tu propuesta recibe respuesta en 15 días o menos." />
      <EmptyState titulo="En construcción — agente buzon" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
