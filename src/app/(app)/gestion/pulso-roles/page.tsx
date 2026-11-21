import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Pulso de roles" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Pulso de roles" subtitulo="Una pregunta sobre la autonomía de tu cargo." />
      <EmptyState titulo="En construcción — agente pulso-circulos" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
