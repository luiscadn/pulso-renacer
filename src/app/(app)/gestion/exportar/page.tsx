import { Download } from "lucide-react";
import { Banner, Card, PageHeader, clasesBoton } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { TABLAS_EXPORTABLES } from "@/features/tablero/exportar";

export const metadata = { title: "Exportar datos" };

export default async function Page() {
  await requireRole("gestion");
  return (
    <>
      <PageHeader titulo="Exportar datos" subtitulo="Descarga las tablas en CSV para abrirlas en Excel." />
      <div className="flex flex-col gap-3">
        <Banner>
          Los archivos no incluyen nombres, firmas, IPs ni correos. En las sugerencias nunca se exporta la firma. Si el modo demostración
          está activo, también salen los datos de demostración.
        </Banner>
        {TABLAS_EXPORTABLES.map((t) => (
          <Card key={t.id} className="flex items-center justify-between gap-3">
            <span className="font-medium">{t.titulo}</span>
            {/* Descarga directa: un enlace normal al route handler (no es navegación de la app). */}
            <a href={`/gestion/exportar/${t.id}`} download className={clasesBoton("secundario")}>
              <Download aria-hidden className="size-5" />
              CSV<span className="sr-only"> de {t.titulo}</span>
            </a>
          </Card>
        ))}
      </div>
    </>
  );
}
