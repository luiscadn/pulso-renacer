import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { PREGUNTAS_PULSO } from "@/lib/labels";
import { responderPulso } from "@/features/pulso/actions";
import { Consentimiento } from "@/features/pulso/components/Consentimiento";
import { FormPulso } from "@/features/pulso/components/FormPulso";
import { YaRespondiste } from "@/features/pulso/components/YaRespondiste";
import { cookiePulso, semanaActual } from "@/features/pulso/semana";

export const metadata = { title: "Pulso semanal" };
export const dynamic = "force-dynamic";

const PREGUNTAS = (["p1", "p2", "p3", "p4", "p5", "p6"] as const).map((k) => ({ clave: k, texto: PREGUNTAS_PULSO[k] }));

export default async function Page() {
  await requireRole("equipo");
  const yaRespondio = Boolean((await cookies()).get(cookiePulso(semanaActual())));
  return (
    <>
      <PageHeader titulo="Pulso semanal" subtitulo="Seis afirmaciones, un minuto, una vez por semana." />
      {yaRespondio ? (
        <YaRespondiste />
      ) : (
        <>
          <Consentimiento />
          <p className="mb-4 text-base text-texto-suave">Marca qué tan de acuerdo estás con cada afirmación (1 = total desacuerdo, 5 = total acuerdo).</p>
          <FormPulso preguntas={PREGUNTAS} accion={responderPulso} />
        </>
      )}
    </>
  );
}
