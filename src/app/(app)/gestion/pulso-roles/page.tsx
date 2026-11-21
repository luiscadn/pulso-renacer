import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { PREGUNTAS_PULSO } from "@/lib/labels";
import { responderPulsoRoles } from "@/features/pulso/actions";
import { Consentimiento } from "@/features/pulso/components/Consentimiento";
import { FormPulso } from "@/features/pulso/components/FormPulso";
import { YaRespondiste } from "@/features/pulso/components/YaRespondiste";
import { cookiePulsoRoles, semanaActual } from "@/features/pulso/semana";

export const metadata = { title: "Pulso de roles" };
export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole("gestion");
  const yaRespondio = Boolean((await cookies()).get(cookiePulsoRoles(semanaActual())));
  return (
    <>
      <PageHeader titulo="Pulso de roles" subtitulo="Una pregunta sobre la autonomía de tu cargo." />
      {yaRespondio ? (
        <YaRespondiste pregunta="esta pregunta" />
      ) : (
        <>
          <Consentimiento extra="Esta pregunta es para quienes tienen un cargo con decisiones propias. Tampoco guarda quién eres." />
          <FormPulso
            preguntas={[{ clave: "p7", texto: PREGUNTAS_PULSO.p7 }]}
            accion={responderPulsoRoles}
            textoEnviar="Enviar mi respuesta"
          />
        </>
      )}
    </>
  );
}
