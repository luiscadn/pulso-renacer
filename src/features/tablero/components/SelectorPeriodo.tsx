import Link from "next/link";
import { Button, Field, Input, cn } from "@/components/ui";
import type { Rango } from "../metricas";
import type { OpcionPeriodo } from "../periodo";

const base = "inline-flex min-h-11 items-center justify-center rounded-xl2 border px-4 text-base font-medium";
const activo = "border-primario-osc bg-primario-osc text-white";
const inactivo = "border-borde bg-white text-texto hover:bg-arena";

/** Selector de periodo sin JavaScript: enlaces y un formulario GET. El periodo vive en la URL. */
export function SelectorPeriodo({ opcion, periodo, hoy }: { opcion: OpcionPeriodo; periodo: Rango; hoy: string }) {
  return (
    <section aria-label="Periodo" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Link href="?p=14" aria-current={opcion === "14" ? "true" : undefined} className={cn(base, opcion === "14" ? activo : inactivo)}>
          14 días
        </Link>
        <Link href="?p=30" aria-current={opcion === "30" ? "true" : undefined} className={cn(base, opcion === "30" ? activo : inactivo)}>
          30 días
        </Link>
      </div>
      <details open={opcion === "rango"} className="rounded-xl2 border-2 border-borde bg-white px-3">
        <summary className="min-h-11 cursor-pointer py-2.5 font-medium">Elegir un rango de fechas</summary>
        <form method="get" className="flex flex-col gap-3 pb-3">
          <input type="hidden" name="p" value="rango" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde">
              <Input type="date" name="desde" defaultValue={periodo.desde} max={hoy} required />
            </Field>
            <Field label="Hasta">
              <Input type="date" name="hasta" defaultValue={periodo.hasta} max={hoy} required />
            </Field>
          </div>
          <Button type="submit" variante="secundario">Ver este rango</Button>
        </form>
      </details>
    </section>
  );
}
