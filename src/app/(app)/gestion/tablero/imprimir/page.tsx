import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Tablero para imprimir" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Tablero para imprimir" subtitulo="Versión para imprimir o guardar como PDF." />
      <EmptyState titulo="En construcción — agente tablero" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
