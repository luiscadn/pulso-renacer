import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { leerAjustes } from "@/lib/ajustes";
import { esModoDemo } from "@/lib/demo";
import { claveDia, sumarDias } from "@/lib/fechas";
import { DatosDemo } from "@/features/ajustes/components/DatosDemo";
import { FormularioAjustes } from "@/features/ajustes/components/FormularioAjustes";
import { QrAcceso } from "@/features/ajustes/components/QrAcceso";

export const metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("gestion");
  const a = await leerAjustes();
  const hoy = new Date();
  return (
    <div className="flex flex-col gap-8">
      <PageHeader titulo="Ajustes" subtitulo="Línea base, anonimato, cabinas y datos de demostración." />
      <FormularioAjustes
        valores={{
          lineaBaseInicio: a.lineaBaseInicio ?? claveDia(hoy),
          lineaBaseFin: a.lineaBaseFin ?? claveDia(sumarDias(hoy, 13)),
          umbralAnonimato: a.umbralAnonimato ?? "3",
          metaCirculos: a.metaCirculos ?? "6",
          cabinas: a.cabinas ?? "Cabina 1,Cabina 2,Cabina 3,Láser",
          kitCabinasActualizadas: a.kitCabinasActualizadas ?? "0",
          kitCabinasTotal: a.kitCabinasTotal ?? "4",
        }}
      />
      <QrAcceso />
      {esModoDemo() && <DatosDemo />}
    </div>
  );
}
