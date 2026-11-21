import { db } from "@/lib/db";
import { filtroDemo } from "@/lib/demo";
import { fechaLimiteSugerencia } from "@/lib/fechas";
import { protegido, umbral } from "@/lib/privacidad";
import { estadoPlazo, estaRespondida } from "./plazo";

export type FiltroBuzon = "pendientes" | "vencidas" | "respondidas" | "todas";

export async function listarMuro() {
  return db.sugerencia.findMany({
    where: { publicada: true, ...filtroDemo() },
    orderBy: [{ respondidaEn: "desc" }, { fecha: "desc" }],
    // Nunca se leen el texto original ni la firma para el muro.
    select: { id: true, categoria: true, estado: true, resumenPublico: true, respuesta: true, respondidaEn: true, fecha: true },
  });
}

/** Totales para el resumen del muro (todas las propuestas, publicadas o no), con regla de anonimato. */
export async function resumenMuro() {
  const filas = await db.sugerencia.findMany({ where: filtroDemo(), select: { fecha: true, respondidaEn: true } });
  const minimo = await umbral();
  const aTiempo = filas.filter((f) => f.respondidaEn && f.respondidaEn.getTime() <= fechaLimiteSugerencia(f.fecha).getTime()).length;
  return { ...protegido(filas.length, () => ({ recibidas: filas.length, aTiempo }), minimo), minimo };
}

export async function listarBandeja(filtro: FiltroBuzon, hoy: Date = new Date()) {
  const filas = await db.sugerencia.findMany({ where: filtroDemo(), orderBy: { fecha: "asc" } });
  const conPlazo = filas.map((s) => ({ ...s, limite: fechaLimiteSugerencia(s.fecha), plazo: estadoPlazo(s.fecha, s.respondidaEn, hoy) }));
  const cuentas = {
    pendientes: conPlazo.filter((s) => s.plazo === "a_tiempo" || s.plazo === "por_vencer").length,
    vencidas: conPlazo.filter((s) => s.plazo === "vencida").length,
    respondidas: conPlazo.filter((s) => estaRespondida(s.plazo)).length,
    todas: conPlazo.length,
  };
  const lista = conPlazo.filter((s) => {
    if (filtro === "pendientes") return s.plazo === "a_tiempo" || s.plazo === "por_vencer";
    if (filtro === "vencidas") return s.plazo === "vencida";
    if (filtro === "respondidas") return estaRespondida(s.plazo);
    return true;
  });
  return { lista, cuentas };
}
