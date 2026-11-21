import { z } from "zod";
import { separarCabinas } from "@/lib/ajustes";
import { fechaDesdeClave } from "@/lib/fechas";

const fechaReal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha válida.")
  .refine((c) => { const f = fechaDesdeClave(c); return !Number.isNaN(f.getTime()) && f.toISOString().slice(0, 10) === c; }, "Esa fecha no existe en el calendario.");

const entero = (min: number, mensaje: string) =>
  z.coerce.number({ error: mensaje }).int(mensaje).min(min, mensaje).max(9999, mensaje);

export const esquemaAjustes = z
  .object({
    lineaBaseInicio: fechaReal,
    lineaBaseFin: fechaReal,
    umbralAnonimato: entero(3, "El umbral de anonimato debe ser 3 o más, para proteger a las personas."),
    metaCirculos: entero(1, "La meta de círculos debe ser 1 o más."),
    cabinas: z
      .string()
      .transform((v) => separarCabinas(v))
      .pipe(
        z
          .array(z.string().max(40, "Cada nombre de cabina admite máximo 40 caracteres."))
          .min(1, "Escribe al menos una cabina.")
          .max(20, "Máximo 20 cabinas."),
      ),
    kitCabinasActualizadas: entero(0, "Las cabinas actualizadas deben ser 0 o más."),
    kitCabinasTotal: entero(1, "El total de cabinas debe ser 1 o más."),
  })
  .refine((d) => d.lineaBaseFin >= d.lineaBaseInicio, { path: ["lineaBaseFin"], message: "La línea base debe terminar el mismo día o después de empezar." })
  .refine((d) => d.kitCabinasActualizadas <= d.kitCabinasTotal, {
    path: ["kitCabinasActualizadas"],
    message: "Las cabinas actualizadas no pueden ser más que el total.",
  });

export type AjustesValidados = z.infer<typeof esquemaAjustes>;
