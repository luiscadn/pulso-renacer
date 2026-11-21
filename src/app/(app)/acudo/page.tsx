import { EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "¿A quién acudo?" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader titulo="¿A quién acudo?" subtitulo="Quién resuelve cada situación y cuándo escalar." />
      <EmptyState titulo="En construcción — agente mapa-semaforo" descripcion="Este módulo se está preparando. Muy pronto estará listo." />
    </>
  );
}
