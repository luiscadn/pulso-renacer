import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Ajustes" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Ajustes" subtitulo="Línea base, anonimato, cabinas y datos de demostración." />
      <EmptyState titulo="En construcción — agente tablero" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
