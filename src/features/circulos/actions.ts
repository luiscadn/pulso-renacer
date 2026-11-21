"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { fechaDesdeClave } from "@/lib/fechas";
import { accion, ErrorAmable } from "@/lib/validacion";
import { esquemaActa, esquemaActaEdicion, esquemaMediacion, esquemaMediacionEdicion } from "./esquemas";

function refrescar() {
  revalidatePath("/circulos");
  revalidatePath("/gestion/circulos");
  revalidatePath("/gestion/tablero");
}

export const crearActa = accion(esquemaActa, async ({ fecha, ...textos }) => {
  await requireRole("gestion");
  const acta = await db.actaCirculo.create({ data: { fecha: fechaDesdeClave(fecha), ...textos } });
  refrescar();
  return { id: acta.id };
});

export const actualizarActa = accion(esquemaActaEdicion, async ({ id, fecha, ...textos }) => {
  await requireRole("gestion");
  const existente = await db.actaCirculo.findUnique({ where: { id }, select: { id: true } });
  if (!existente) throw new ErrorAmable("No encontramos esa acta. Puede que ya no exista.");
  await db.actaCirculo.update({ where: { id }, data: { fecha: fechaDesdeClave(fecha), ...textos } });
  refrescar();
  return { id };
});

export const crearMediacion = accion(esquemaMediacion, async ({ fecha, resultado }) => {
  await requireRole("gestion");
  await db.mediacion.create({ data: { fecha: fechaDesdeClave(fecha), resultado } });
  refrescar();
  return { ok: true };
});

export const actualizarMediacion = accion(esquemaMediacionEdicion, async ({ id, resultado, seguimientoHecho }) => {
  await requireRole("gestion");
  const existente = await db.mediacion.findUnique({ where: { id }, select: { id: true } });
  if (!existente) throw new ErrorAmable("No encontramos esa mediación.");
  await db.mediacion.update({ where: { id }, data: { resultado, seguimientoHecho } });
  refrescar();
  return { ok: true };
});
