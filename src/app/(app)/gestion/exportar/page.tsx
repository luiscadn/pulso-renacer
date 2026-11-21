import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Exportar datos" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Exportar datos" subtitulo="Descarga las tablas en CSV para Excel." />
      <EmptyState titulo="En construcción — agente tablero" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
