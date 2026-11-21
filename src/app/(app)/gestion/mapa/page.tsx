import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Editar el mapa" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Editar el mapa" subtitulo="Crea, ordena y valida las tarjetas de «¿A quién acudo?»." />
      <EmptyState titulo="En construcción — agente mapa-semaforo" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
