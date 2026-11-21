import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Tablero de indicadores" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Tablero de indicadores" subtitulo="Los indicadores de la estrategia, calculados solos." />
      <EmptyState titulo="En construcción — agente tablero" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
