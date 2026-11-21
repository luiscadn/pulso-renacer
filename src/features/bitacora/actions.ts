"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { accion, ErrorAmable } from "@/lib/validacion";
import { sumarDias } from "@/lib/fechas";
import { esquemaAbrir, esquemaCerrar, esquemaRevertida, esquemaResuelta } from "./esquemas";
import { calcularTiempoRespuesta, DIAS_RECIENTES, horaDeDiaBogota } from "./logica";

const RUTA = "/bitacora";

export const abrirConsulta = accion(esquemaAbrir, async (datos) => {
  await requireRole("equipo");
  const c = await db.consulta.create({ data: datos, select: { id: true } });
  revalidatePath(RUTA);
  return { id: c.id };
});

export const cerrarConsulta = accion(esquemaCerrar, async (d) => {
  await requireRole("equipo");
  const abierta = await db.consulta.findUnique({ where: { id: d.id } });
  if (!abierta || abierta.cerradaEn) throw new ErrorAmable("Esta consulta ya estaba cerrada o no existe.");
  const cerradaEn = new Date();
  const tiempoRespuesta = calcularTiempoRespuesta(abierta.abiertaEn, cerradaEn, d.recibioRespuesta);
  await db.consulta.update({
    where: { id: d.id },
    data: {
      cerradaEn,
      recibioRespuesta: d.recibioRespuesta,
      tiempoRespuesta,
      decidio: d.decidio,
      escalada: d.escalada,
      motivoEscalamiento: d.motivoEscalamiento ?? null,
    },
  });
  revalidatePath(RUTA);
  return { tiempoRespuesta };
});

export const registrarResuelta = accion(esquemaResuelta, async (d) => {
  await requireRole("equipo");
  // Mediodía de Bogotá del día elegido; la hora de cierre se ajusta al tiempo de respuesta elegido a mano.
  const ahora = new Date();
  const abierta = horaDeDiaBogota(d.fecha, 12);
  const horas = { MISMO_DIA: 3, MENOS_24H: 20, MAS_24H: 36, SIN_RESPUESTA: 3 }[d.tiempoRespuesta];
  const cerradaEn = new Date(Math.min(abierta.getTime() + horas * 3_600_000, ahora.getTime()));
  const abiertaEn = new Date(Math.min(abierta.getTime(), cerradaEn.getTime()));
  await db.consulta.create({
    data: {
      abiertaEn,
      cerradaEn,
      quienConsulta: d.quienConsulta,
      tipo: d.tipo,
      dirigidaA: d.dirigidaA,
      recibioRespuesta: d.recibioRespuesta,
      tiempoRespuesta: d.tiempoRespuesta,
      decidio: d.decidio,
      escalada: d.escalada,
      motivoEscalamiento: d.motivoEscalamiento ?? null,
    },
  });
  revalidatePath(RUTA);
  return { ok: true };
});

export const marcarRevertida = accion(esquemaRevertida, async (d) => {
  await requireRole("equipo");
  const c = await db.consulta.findUnique({ where: { id: d.id } });
  const desde = sumarDias(new Date(), -DIAS_RECIENTES);
  if (!c || !c.cerradaEn || c.cerradaEn < desde) throw new ErrorAmable("Solo puedes marcar consultas cerradas en los últimos 30 días.");
  if (c.decidio !== "ROL_DELEGADO") throw new ErrorAmable("Solo aplica a consultas que decidió un rol delegado.");
  await db.consulta.update({ where: { id: d.id }, data: { revertida: true, revertidaPor: d.revertidaPor } });
  revalidatePath(RUTA);
  return { ok: true };
});
