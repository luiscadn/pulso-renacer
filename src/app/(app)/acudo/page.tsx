import Link from "next/link";
import { Banner, EmptyState, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { TIPO_SITUACION } from "@/lib/labels";
import { BuscadorMapa } from "@/features/mapa/components/BuscadorMapa";
import { situacionesActivas } from "@/features/mapa/queries";

export const metadata = { title: "¿A quién acudo?" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("equipo");
  const situaciones = await situacionesActivas();
  const hayPorValidar = situaciones.some((s) => s.porValidar);
  const tarjetas = situaciones.map((s) => ({
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
  }));
  const usados = new Set(situaciones.map((s) => s.tipo));
  const tipos = Object.entries(TIPO_SITUACION)
    .filter(([valor]) => usados.has(valor as keyof typeof TIPO_SITUACION))
    .map(([valor, etiqueta]) => ({ valor, etiqueta }));

  return (
    <>
      <PageHeader titulo="¿A quién acudo?" subtitulo="Quién resuelve cada situación y cuándo escalar." />
      <div className="flex flex-col gap-4">
        {hayPorValidar && <Banner tipo="info">Versión preliminar. Se valida con el equipo en el taller de roles.</Banner>}
        {situaciones.length === 0 ? (
          <EmptyState titulo="Aún no hay tarjetas" descripcion="Cuando la administración publique el mapa, lo verás aquí." />
        ) : (
          <BuscadorMapa tarjetas={tarjetas} tipos={tipos} />
        )}
        <p className="rounded-xl2 bg-arena p-4 text-base">
          ¿No encuentras tu caso? Registra la consulta en la{" "}
          <Link href="/bitacora" className="font-semibold text-primario-osc underline">
            bitácora
          </Link>{" "}
          y pregúntale a la administradora.
        </p>
      </div>
    </>
  );
}
