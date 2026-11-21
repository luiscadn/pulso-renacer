"use server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { accion, zColorSemaforo, zMotivoAviso } from "@/lib/validacion";

/** Registra el aviso. Nunca recibe ni guarda iniciales ni datos de la paciente. */
const esquema = z
  .object({
    color: zColorSemaforo,
    motivo: zMotivoAviso,
    minutosRetraso: z.coerce.number().int().min(0).max(600).optional(),
    minutosAnticipacion: z.coerce.number().int().min(0).max(1440),
  })
  .strip();

export const registrarAviso = accion(esquema, async (d) => {
  await requireRole("equipo");
  await db.avisoAgenda.create({
    data: {
      color: d.color,
      motivo: d.motivo,
      minutosRetraso: d.color === "VERDE" ? null : (d.minutosRetraso ?? null),
      minutosAnticipacion: d.minutosAnticipacion,
    },
  });
  return null;
});
