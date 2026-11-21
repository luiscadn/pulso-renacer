import { ButtonLink, PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { FormularioSugerencia } from "@/features/buzon/components/FormularioSugerencia";

export const metadata = { title: "Proponer mejora" };

export default async function Page() {
  await requireRole("equipo");
  return (
    <>
      <PageHeader
        titulo="Proponer mejora"
        subtitulo="Tu propuesta recibe respuesta en 15 días o menos."
        accion={<ButtonLink href="/muro" variante="fantasma">Ver el muro</ButtonLink>}
      />
      <FormularioSugerencia />
    </>
  );
}
