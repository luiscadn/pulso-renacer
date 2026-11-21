import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui";
import { proximoLunes, textoFechaLunes } from "../semana";

export function YaRespondiste({ pregunta = "el pulso" }: { pregunta?: string }) {
  return (
    <Card className="flex flex-col items-center gap-3 py-8 text-center">
      <CheckCircle2 aria-hidden className="size-10 text-verde" />
      <p className="font-serif text-xl font-semibold">Ya respondiste {pregunta} de esta semana. ¡Gracias!</p>
      <p className="max-w-sm text-base text-texto-suave">
        Puedes volver el {textoFechaLunes(proximoLunes())}, cuando empieza una nueva semana.
      </p>
    </Card>
  );
}
