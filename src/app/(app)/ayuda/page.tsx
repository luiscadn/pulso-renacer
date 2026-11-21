import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { ayuda as mapa } from "@/features/mapa/ayuda";
import { ayuda as semaforo } from "@/features/semaforo/ayuda";
import { ayuda as bitacora } from "@/features/bitacora/ayuda";
import { ayuda as buzon } from "@/features/buzon/ayuda";
import { ayuda as pulso } from "@/features/pulso/ayuda";
import { ayuda as circulos } from "@/features/circulos/ayuda";
import { ayuda as tablero } from "@/features/tablero/ayuda";

export const metadata = { title: "Ayuda" };

const MODULOS = [mapa, semaforo, bitacora, buzon, pulso, circulos, tablero];

export default async function AyudaPage() {
  const { rol } = await requireRole("equipo");
  const visibles = MODULOS.filter((m) => !m.soloGestion || rol === "gestion");
  return (
    <>
      <PageHeader titulo="Ayuda" subtitulo="Cómo usar cada parte de Pulso Renacer." />
      <nav aria-label="Más opciones" className="mb-6 grid grid-cols-2 gap-2">
        {[
          ["/buzon", "Proponer mejora"],
          ["/muro", "Propusiste / Hicimos"],
          ["/pulso", "Pulso semanal"],
          ["/circulos", "Círculos"],
          ["/privacidad", "Privacidad"],
        ].map(([href, txt]) => (
          <Link key={href} href={href} className="flex min-h-12 items-center rounded-xl2 border border-borde bg-white px-4 font-medium hover:border-primario">
            {txt}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-3">
        {visibles.map((m) => (
          <Card key={m.titulo}>
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center font-serif text-lg font-semibold">{m.titulo}</summary>
              {m.pasos.length > 0 ? (
                <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                  {m.pasos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-texto-suave">Pronto encontrarás aquí las instrucciones de este módulo.</p>
              )}
            </details>
          </Card>
        ))}
      </div>
    </>
  );
}
