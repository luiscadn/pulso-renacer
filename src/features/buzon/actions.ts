"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { fechaLimiteSugerencia, soloFecha } from "@/lib/fechas";
import { accion, ErrorAmable } from "@/lib/validacion";
import { fechaLarga } from "./formato";
import { esquemaEnviar, esquemaResponder } from "./esquemas";

/** Guarda solo los campos del schema; `fecha` es solo el día (Bogotá), sin hora. */
export const enviarSugerencia = accion(esquemaEnviar, async (d) => {
  await requireRole("equipo");
  const fecha = soloFecha();
  await db.sugerencia.create({
    data: { fecha, categoria: d.categoria, texto: d.texto, firma: d.firmar ? (d.firma ?? null) : null },
  });
  revalidatePath("/muro");
  revalidatePath("/gestion/buzon");
  revalidatePath("/inicio");
  return { limite: fechaLarga(fechaLimiteSugerencia(fecha)) };
});

export const guardarRespuesta = accion(esquemaResponder, async (d) => {
  await requireRole("gestion");
  const actual = await db.sugerencia.findUnique({ where: { id: d.id }, select: { respondidaEn: true } });
  if (!actual) throw new ErrorAmable("No encontramos esa propuesta. Recarga la página.");
  await db.sugerencia.update({
    where: { id: d.id },
    data: {
      estado: d.estado,
      resumenPublico: d.resumenPublico ?? null,
      respuesta: d.respuesta ?? null,
      // La fecha de la primera respuesta se conserva: no se «reinicia» el plazo al editar.
      respondidaEn: d.respuesta ? (actual.respondidaEn ?? soloFecha()) : null,
      publicada: d.publicada,
    },
  });
  revalidatePath("/muro");
  revalidatePath("/gestion/buzon");
  revalidatePath("/inicio");
  return { guardado: true };
});
