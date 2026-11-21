import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Pulso semanal" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="Pulso semanal" subtitulo="Seis preguntas anónimas, una vez por semana." />
      <EmptyState titulo="En construcción — agente pulso-circulos" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
