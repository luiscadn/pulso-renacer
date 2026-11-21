import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { TIPO_SITUACION } from "@/lib/labels";
import { GestionMapa } from "@/features/mapa/components/GestionMapa";
import { todasLasSituaciones } from "@/features/mapa/queries";

export const metadata = { title: "Editar el mapa" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("gestion");
  const situaciones = await todasLasSituaciones();
  const filas = situaciones.map((s) => ({
    id: s.id,
    titulo: s.titulo,
    ejemplo: s.ejemplo,
    tipo: s.tipo,
    tipoEtiqueta: TIPO_SITUACION[s.tipo],
    quienResuelve: s.quienResuelve,
    tiempoEsperado: s.tiempoEsperado,
    cuandoEscalar: s.cuandoEscalar,
    comoHacerlo: s.comoHacerlo,
    porValidar: s.porValidar,
    activo: s.activo,
  }));
  const tipos = Object.entries(TIPO_SITUACION).map(([valor, etiqueta]) => ({ valor, etiqueta }));
  return (
    <>
      <PageHeader titulo="Editar el mapa" subtitulo="Crea, ordena y valida las tarjetas de «¿A quién acudo?»." />
      <GestionMapa filas={filas} tipos={tipos} />
    </>
  );
}
