import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { cabinas } from "@/lib/ajustes";
import { MOTIVO_AVISO } from "@/lib/labels";
import { FormularioAviso } from "@/features/semaforo/components/FormularioAviso";

export const metadata = { title: "Avisar retraso" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("equipo");
  const lista = await cabinas();
  const motivos = Object.entries(MOTIVO_AVISO).map(([valor, etiqueta]) => ({ valor, etiqueta }));
  return (
    <>
      <PageHeader titulo="Avisar retraso" subtitulo="Genera el mensaje para WhatsApp en un solo paso." />
      <FormularioAviso cabinas={lista} motivos={motivos} />
    </>
  );
}
