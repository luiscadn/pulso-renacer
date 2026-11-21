import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Círculos y mediaciones" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Círculos y mediaciones" subtitulo="Registra las actas y las mediaciones, sin nombres." />
      <EmptyState titulo="En construcción — agente pulso-circulos" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
