import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Bandeja del buzón" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Bandeja del buzón" subtitulo="Responde las propuestas antes de su fecha límite." />
      <EmptyState titulo="En construcción — agente buzon" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
