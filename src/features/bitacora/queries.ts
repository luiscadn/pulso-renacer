import { db } from "@/lib/db";
import { filtroDemo } from "@/lib/demo";
import { sumarDias } from "@/lib/fechas";
import { DIAS_RECIENTES } from "./logica";

export type ConsultaVista = {
  id: string;
  abiertaEn: string;
  cerradaEn: string | null;
  quienConsulta: string;
  tipo: string;
  dirigidaA: string;
  decidio: string | null;
  recibioRespuesta: boolean | null;
  tiempoRespuesta: string | null;
  escalada: boolean;
  revertida: boolean;
  revertidaPor: string | null;
};

type Fila = Awaited<ReturnType<typeof db.consulta.findMany>>[number];

function vista(c: Fila): ConsultaVista {
  return {
    id: c.id,
    abiertaEn: c.abiertaEn.toISOString(),
    cerradaEn: c.cerradaEn?.toISOString() ?? null,
    quienConsulta: c.quienConsulta,
    tipo: c.tipo,
    dirigidaA: c.dirigidaA,
    decidio: c.decidio,
    recibioRespuesta: c.recibioRespuesta,
    tiempoRespuesta: c.tiempoRespuesta,
    escalada: c.escalada,
    revertida: c.revertida,
    revertidaPor: c.revertidaPor,
  };
}

/** Consultas abiertas, las más antiguas primero (son las más urgentes). */
export async function listarAbiertas(): Promise<ConsultaVista[]> {
  const filas = await db.consulta.findMany({
    where: { cerradaEn: null, ...filtroDemo() },
    orderBy: { abiertaEn: "asc" },
  });
  return filas.map(vista);
}

/** Cerradas en los últimos 30 días, las más recientes primero. */
export async function listarRecientes(): Promise<ConsultaVista[]> {
  const filas = await db.consulta.findMany({
    where: { cerradaEn: { gte: sumarDias(new Date(), -DIAS_RECIENTES) }, ...filtroDemo() },
    orderBy: { cerradaEn: "desc" },
  });
  return filas.map(vista);
}
