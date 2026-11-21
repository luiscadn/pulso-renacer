import { z } from "zod";
import { claveDia, sumarDias } from "@/lib/fechas";
import {
  zDecisor,
  zDestinatario,
  zFechaISO,
  zMotivoEscalamiento,
  zRolConsultante,
  zTiempoRespuesta,
  zTipoSituacion,
} from "@/lib/validacion";
import { DIAS_RESUELTA_MAX } from "./logica";

/** «Sí / No» que llega como booleano o como 'true' / 'false' (FormData). */
const zSiNo = (mensaje: string) =>
  z.preprocess(
    (v) => (v === true ? "true" : v === false ? "false" : v),
    z.enum(["true", "false"], { error: mensaje }).transform((v) => v === "true"),
  );

const zMotivoOpcional = z.preprocess((v) => (v === "" ? undefined : v), zMotivoEscalamiento.optional());

const MENSAJE_MOTIVO = "Cuéntanos por qué se escaló a la propietaria.";

export const esquemaAbrir = z.object({
  quienConsulta: zRolConsultante,
  tipo: zTipoSituacion,
  dirigidaA: zDestinatario,
});

const camposCierre = {
  recibioRespuesta: zSiNo("Cuéntanos si recibió respuesta."),
  decidio: zDecisor,
  escalada: zSiNo("Cuéntanos si se escaló a la propietaria."),
  motivoEscalamiento: zMotivoOpcional,
};

type ConEscalamiento = { escalada: boolean; motivoEscalamiento?: unknown };
const motivoObligatorio = (d: ConEscalamiento) => !d.escalada || d.motivoEscalamiento !== undefined;

export const esquemaCerrar = z
  .object({ id: z.string().min(1), ...camposCierre })
  .refine(motivoObligatorio, { message: MENSAJE_MOTIVO, path: ["motivoEscalamiento"] })
  .transform((d) => ({ ...d, motivoEscalamiento: d.escalada ? d.motivoEscalamiento : undefined }));

export const esquemaResuelta = z
  .object({
    quienConsulta: zRolConsultante,
    tipo: zTipoSituacion,
    dirigidaA: zDestinatario,
    fecha: zFechaISO,
    tiempoRespuesta: zTiempoRespuesta,
    ...camposCierre,
  })
  .refine(motivoObligatorio, { message: MENSAJE_MOTIVO, path: ["motivoEscalamiento"] })
  .refine((d) => d.fecha <= claveDia(Date.now()), { message: "La fecha no puede ser futura.", path: ["fecha"] })
  .refine((d) => d.fecha >= claveDia(sumarDias(new Date(), -DIAS_RESUELTA_MAX)), {
    message: `Solo puedes registrar consultas de los últimos ${DIAS_RESUELTA_MAX} días.`,
    path: ["fecha"],
  })
  .refine((d) => d.recibioRespuesta === (d.tiempoRespuesta !== "SIN_RESPUESTA"), {
    message: "El tiempo de respuesta no coincide con haber recibido respuesta.",
    path: ["tiempoRespuesta"],
  })
  .transform((d) => ({ ...d, motivoEscalamiento: d.escalada ? d.motivoEscalamiento : undefined }));

export const esquemaRevertida = z.object({
  id: z.string().min(1),
  revertidaPor: zDestinatario,
});
