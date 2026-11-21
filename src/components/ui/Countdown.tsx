import { Clock } from "lucide-react";
import { diasRestantes } from "@/lib/fechas";
import { Chip, type TonoChip } from "./Chip";

/** Días restantes hasta una fecha límite (`@db.Date`): verde > 5, amarillo ≤ 5, rojo si venció. */
export function tonoCuentaRegresiva(dias: number): TonoChip {
  if (dias < 0) return "rojo";
  if (dias <= 5) return "amarillo";
  return "verde";
}

export function textoCuentaRegresiva(dias: number): string {
  if (dias < 0) return dias === -1 ? "Venció hace 1 día" : `Venció hace ${-dias} días`;
  if (dias === 0) return "Vence hoy";
  return dias === 1 ? "Falta 1 día" : `Faltan ${dias} días`;
}

export function Countdown({ limite, ahora }: { limite: Date; ahora?: Date }) {
  const dias = diasRestantes(limite, ahora);
  return (
    <Chip tono={tonoCuentaRegresiva(dias)}>
      <Clock aria-hidden className="size-3.5" />
      {textoCuentaRegresiva(dias)}
    </Chip>
  );
}
