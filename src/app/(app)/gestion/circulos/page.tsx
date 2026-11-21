import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card, CardTitle, Chip, EmptyState, PageHeader, clasesBoton, cn } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { claveDeSoloFecha, formatoCorto } from "@/lib/fechas";
import { ActaCard } from "@/features/circulos/components/ActaCard";
import { FilaMediacion } from "@/features/circulos/components/FilaMediacion";
import { FormActa } from "@/features/circulos/components/FormActa";
import { FormMediacion } from "@/features/circulos/components/FormMediacion";
import { ProtocoloB2 } from "@/features/circulos/components/ProtocoloB2";
import { listarActas, listarMediaciones, obtenerActa, progresoCirculos } from "@/features/circulos/queries";

export const metadata = { title: "Círculos y mediaciones" };
export const dynamic = "force-dynamic";

type Params = Promise<{ tab?: string; editar?: string }>;

export default async function Page({ searchParams }: { searchParams: Params }) {
  await requireRole("gestion");
  const { tab, editar } = await searchParams;
  const activa = tab === "mediaciones" ? "mediaciones" : "actas";
  const pestanas = [
    { id: "actas", etiqueta: "Actas" },
    { id: "mediaciones", etiqueta: "Mediaciones" },
  ];
  return (
    <>
      <PageHeader titulo="Círculos y mediaciones" subtitulo="Registra las actas y las mediaciones, sin nombres." />
      <nav aria-label="Secciones" className="mb-5 grid grid-cols-2 gap-2">
        {pestanas.map((p) => (
          <Link
            key={p.id}
            href={`/gestion/circulos?tab=${p.id}`}
            aria-current={activa === p.id ? "page" : undefined}
            className={cn(
              "flex min-h-12 items-center justify-center rounded-xl2 border-2 text-base font-semibold",
              activa === p.id ? "border-primario-osc bg-primario-osc text-white" : "border-borde bg-white text-primario-osc hover:border-primario",
            )}
          >
            {p.etiqueta}
          </Link>
        ))}
      </nav>
      {activa === "actas" ? <TabActas editarId={editar} /> : <TabMediaciones />}
    </>
  );
}

async function TabActas({ editarId }: { editarId?: string }) {
  const [actas, progreso, enEdicion] = await Promise.all([
    listarActas(),
    progresoCirculos(),
    editarId ? obtenerActa(editarId) : Promise.resolve(null),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardTitle className="mb-1">{enEdicion ? "Editar acta" : "Nueva acta"}</CardTitle>
        <p className="mb-4 text-sm text-texto-suave">
          Círculos realizados: <strong>{progreso.n} / {progreso.meta}</strong>
        </p>
        <FormActa
          key={enEdicion?.id ?? "nueva"}
          acta={enEdicion ? { ...enEdicion, fecha: claveDeSoloFecha(enEdicion.fecha) } : undefined}
        />
        {enEdicion && (
          <Link href="/gestion/circulos?tab=actas" className={clasesBoton("fantasma", "md", "mt-2 w-full")}>
            Cancelar edición
          </Link>
        )}
      </Card>
      <section aria-labelledby="actas-titulo" className="flex flex-col gap-4">
        <h2 id="actas-titulo" className="font-serif text-xl font-semibold">Actas publicadas</h2>
        {actas.length === 0 ? (
          <EmptyState titulo="Aún no hay actas" descripcion="Guarda la primera con el formulario de arriba." />
        ) : (
          actas.map((a) => (
            <ActaCard
              key={a.id}
              acta={a}
              acciones={
                <Link
                  href={`/gestion/circulos?tab=actas&editar=${a.id}`}
                  className={clasesBoton("secundario", "md")}
                  aria-label={`Editar el acta del ${formatoCorto(a.fecha, { soloFecha: true })}`}
                >
                  <Pencil aria-hidden className="size-4" /> Editar
                </Link>
              }
            />
          ))
        )}
      </section>
    </div>
  );
}

async function TabMediaciones() {
  const mediaciones = await listarMediaciones();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardTitle className="mb-3">Nueva mediación</CardTitle>
          <FormMediacion />
        </Card>
        <section aria-labelledby="med-titulo" className="flex flex-col gap-3">
          <h2 id="med-titulo" className="flex items-center gap-2 font-serif text-xl font-semibold">
            Mediaciones <Chip>{mediaciones.length}</Chip>
          </h2>
          {mediaciones.length === 0 ? (
            <EmptyState titulo="Aún no hay mediaciones" descripcion="Cuando registres una, aparecerá aquí para hacerle seguimiento." />
          ) : (
            <ul className="flex flex-col gap-3">
              {mediaciones.map((m) => (
                <FilaMediacion
                  key={m.id}
                  id={m.id}
                  fechaTexto={formatoCorto(m.fecha, { soloFecha: true })}
                  resultado={m.resultado}
                  seguimientoHecho={m.seguimientoHecho}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
      <ProtocoloB2 />
    </div>
  );
}
