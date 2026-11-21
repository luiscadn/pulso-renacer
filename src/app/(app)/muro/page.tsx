import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Propusiste / Hicimos" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="Propusiste / Hicimos" subtitulo="Lo que propusieron y lo que hicimos con eso." />
      <EmptyState titulo="En construcción — agente buzon" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
