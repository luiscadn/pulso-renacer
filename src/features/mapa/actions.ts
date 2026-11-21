"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { accion, ErrorAmable, zBool, zTexto, zTextoOpcional, zTipoSituacion } from "@/lib/validacion";
import { reordenar } from "./logica";

function refrescar() {
  revalidatePath("/acudo");
  revalidatePath("/gestion/mapa");
}

const esquemaSituacion = z.object({
  id: z.string().optional(),
  titulo: zTexto(120),
  ejemplo: zTexto(300),
  tipo: zTipoSituacion,
  quienResuelve: zTexto(120),
  tiempoEsperado: zTexto(80),
  cuandoEscalar: zTexto(300),
  comoHacerlo: zTextoOpcional(300),
  porValidar: zBool,
  activo: zBool,
});

export const guardarSituacion = accion(esquemaSituacion, async ({ id, ...datos }) => {
  await requireRole("gestion");
  const data = { ...datos, comoHacerlo: datos.comoHacerlo ?? null };
  if (id) {
    await db.situacionMapa.update({ where: { id }, data });
  } else {
    const ultima = await db.situacionMapa.aggregate({ _max: { orden: true } });
    await db.situacionMapa.create({ data: { ...data, orden: (ultima._max.orden ?? 0) + 1 } });
  }
  refrescar();
  return { mensaje: id ? "Guardamos los cambios." : "Creamos la tarjeta." };
});

const esquemaId = z.object({ id: z.string().min(1) });

export const alternarActiva = accion(esquemaId, async ({ id }) => {
  await requireRole("gestion");
  const s = await db.situacionMapa.findUnique({ where: { id } });
  if (!s) throw new ErrorAmable("No encontramos esa tarjeta.");
  await db.situacionMapa.update({ where: { id }, data: { activo: !s.activo } });
  refrescar();
  return { activo: !s.activo };
});

export const marcarValidada = accion(esquemaId, async ({ id }) => {
  await requireRole("gestion");
  await db.situacionMapa.update({ where: { id }, data: { porValidar: false } });
  refrescar();
  return null;
});

export const moverSituacion = accion(
  z.object({ id: z.string().min(1), direccion: z.coerce.number().pipe(z.union([z.literal(-1), z.literal(1)])) }),
  async ({ id, direccion }) => {
    await requireRole("gestion");
    const filas = await db.situacionMapa.findMany({ orderBy: { orden: "asc" }, select: { id: true } });
    const nuevo = reordenar(filas.map((f) => f.id), id, direccion);
    await db.$transaction(nuevo.map((sid, i) => db.situacionMapa.update({ where: { id: sid }, data: { orden: i + 1 } })));
    refrescar();
    return null;
  },
);
