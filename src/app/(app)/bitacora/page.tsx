import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { BitacoraCliente } from "@/features/bitacora/components/BitacoraCliente";
import { listarAbiertas, listarRecientes } from "@/features/bitacora/queries";

export const metadata = { title: "Bitácora de consultas" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("equipo");
  const [abiertas, recientes] = await Promise.all([listarAbiertas(), listarRecientes()]);
  return (
    <>
      <PageHeader titulo="Bitácora de consultas" subtitulo="Registra tus consultas para saber si reciben respuesta." />
      <BitacoraCliente abiertas={abiertas} recientes={recientes} />
    </>
  );
}
