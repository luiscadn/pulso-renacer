import { db } from "@/lib/db";

export async function situacionesActivas() {
  return db.situacionMapa.findMany({ where: { activo: true }, orderBy: { orden: "asc" } });
}

export async function todasLasSituaciones() {
  return db.situacionMapa.findMany({ orderBy: { orden: "asc" } });
}

export type Situacion = Awaited<ReturnType<typeof todasLasSituaciones>>[number];
