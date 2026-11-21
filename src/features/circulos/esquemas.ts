import { z } from "zod";
import { claveDia } from "@/lib/fechas";
import { zFechaISO, zResultadoMediacion, zTexto, zBool } from "@/lib/validacion";

export const MAX_ACTA = 300;

const noFutura = (f: string) => f <= claveDia(Date.now());

export const esquemaActa = z.object({
  fecha: zFechaISO.refine(noFutura, "La fecha del círculo no puede ser futura."),
  funciono: zTexto(MAX_ACTA),
  seTrabo: zTexto(MAX_ACTA),
  carga: zTexto(MAX_ACTA),
  acordamos: zTexto(MAX_ACTA),
});

export const esquemaActaEdicion = esquemaActa.extend({ id: z.string().min(1) });

export const esquemaMediacion = z.object({
  fecha: zFechaISO.refine(noFutura, "La fecha de la mediación no puede ser futura."),
  resultado: zResultadoMediacion,
});

export const esquemaMediacionEdicion = z.object({
  id: z.string().min(1),
  resultado: zResultadoMediacion,
  seguimientoHecho: zBool,
});
