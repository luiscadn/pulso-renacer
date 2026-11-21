import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Bitácora de consultas" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="Bitácora de consultas" subtitulo="Registra tus consultas para saber si reciben respuesta." />
      <EmptyState titulo="En construcción — agente bitacora" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
