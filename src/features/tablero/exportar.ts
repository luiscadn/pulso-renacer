import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { filtroDemo } from "@/lib/demo";
import { claveDeSoloFecha, ZONA } from "@/lib/fechas";
import {
  CATEGORIA_SUGERENCIA, COLOR_SEMAFORO_CORTO, DECISOR, DESTINATARIO, ESTADO_SUGERENCIA, MOTIVO_AVISO,
  MOTIVO_ESCALAMIENTO, RESULTADO_MEDIACION, ROL_CONSULTANTE, TIEMPO_RESPUESTA, TIPO_SITUACION,
} from "@/lib/labels";
import { aCsv, type Celda } from "./csv";
import { leerTablero } from "./queries";
import { formatearValor } from "./formato";
import { ESTADOS_TEXTO } from "./estados";

const dt = (d: Date | null) => (d ? format(new TZDate(d.getTime(), ZONA), "yyyy-MM-dd HH:mm") : "");
const dia = (d: Date | null) => (d ? claveDeSoloFecha(d) : "");
const et = <K extends string>(m: Record<K, string>, k: K | null) => (k ? m[k] : "");

export const TABLAS_EXPORTABLES = [
  { id: "consultas", titulo: "Consultas (bitácora)" },
  { id: "sugerencias", titulo: "Sugerencias (sin firma)" },
  { id: "avisos", titulo: "Avisos de agenda (semáforo)" },
  { id: "pulso", titulo: "Respuestas del pulso" },
  { id: "pulso-roles", titulo: "Respuestas del pulso de roles" },
  { id: "actas", titulo: "Actas de círculos" },
  { id: "mediaciones", titulo: "Mediaciones" },
  { id: "indicadores", titulo: "Indicadores del tablero" },
] as const;
export type TablaExportable = (typeof TABLAS_EXPORTABLES)[number]["id"];

export function esTablaExportable(t: string): t is TablaExportable {
  return TABLAS_EXPORTABLES.some((x) => x.id === t);
}

/** Devuelve el CSV de la tabla (con filtroDemo). Las sugerencias NUNCA incluyen la firma. */
export async function csvDeTabla(tabla: TablaExportable, params: { p?: string; desde?: string; hasta?: string } = {}): Promise<string> {
  const where = filtroDemo();
  switch (tabla) {
    case "consultas": {
      const filas = await db.consulta.findMany({ where, orderBy: { abiertaEn: "asc" } });
      return aCsv(
        ["Abierta (Bogotá)", "Cerrada (Bogotá)", "Quién consulta", "Tipo de situación", "Dirigida a", "¿Recibió respuesta?", "Tiempo de respuesta", "Quién decidió", "¿Escalada a la propietaria?", "Motivo del escalamiento", "¿Revertida?", "Revertida por", "Dato de demostración"],
        filas.map((c): Celda[] => [dt(c.abiertaEn), dt(c.cerradaEn), ROL_CONSULTANTE[c.quienConsulta], TIPO_SITUACION[c.tipo], DESTINATARIO[c.dirigidaA], c.recibioRespuesta, et(TIEMPO_RESPUESTA, c.tiempoRespuesta), et(DECISOR, c.decidio), c.escalada, et(MOTIVO_ESCALAMIENTO, c.motivoEscalamiento), c.revertida, et(DESTINATARIO, c.revertidaPor), c.esDemo]),
      );
    }
    case "sugerencias": {
      // select explícito: la firma no se lee ni se exporta.
      const filas = await db.sugerencia.findMany({
        where, orderBy: { fecha: "asc" },
        select: { fecha: true, categoria: true, texto: true, estado: true, resumenPublico: true, respuesta: true, respondidaEn: true, publicada: true, esDemo: true },
      });
      return aCsv(
        ["Fecha", "Categoría", "Texto", "Estado", "Resumen público", "Respuesta", "Respondida el", "¿Publicada?", "Dato de demostración"],
        filas.map((s): Celda[] => [dia(s.fecha), CATEGORIA_SUGERENCIA[s.categoria], s.texto, ESTADO_SUGERENCIA[s.estado], s.resumenPublico, s.respuesta, dia(s.respondidaEn), s.publicada, s.esDemo]),
      );
    }
    case "avisos": {
      const filas = await db.avisoAgenda.findMany({ where, orderBy: { creadoEn: "asc" } });
      return aCsv(
        ["Creado (Bogotá)", "Color", "Motivo", "Minutos de retraso", "Minutos de anticipación", "Dato de demostración"],
        filas.map((a): Celda[] => [dt(a.creadoEn), COLOR_SEMAFORO_CORTO[a.color], MOTIVO_AVISO[a.motivo], a.minutosRetraso, a.minutosAnticipacion, a.esDemo]),
      );
    }
    case "pulso": {
      const filas = await db.respuestaPulso.findMany({ where, orderBy: { fecha: "asc" } });
      return aCsv(
        ["Semana", "Fecha", "p1 Sé a quién acudir", "p2 Instrucciones claras", "p3 Acceso a información", "p4 Comunicación recepción-cabinas", "p5 Seguridad para disentir", "p6 Respuesta resolutiva", "Dato de demostración"],
        filas.map((r): Celda[] => [r.semana, dia(r.fecha), r.p1, r.p2, r.p3, r.p4, r.p5, r.p6, r.esDemo]),
      );
    }
    case "pulso-roles": {
      const filas = await db.respuestaPulsoRoles.findMany({ where, orderBy: { fecha: "asc" } });
      return aCsv(["Semana", "Fecha", "p7 Decisiones sin ser revertidas", "Dato de demostración"], filas.map((r): Celda[] => [r.semana, dia(r.fecha), r.p7, r.esDemo]));
    }
    case "actas": {
      const filas = await db.actaCirculo.findMany({ where, orderBy: { fecha: "asc" } });
      return aCsv(["Fecha", "Qué funcionó", "Qué se trabó", "Cómo está la carga", "Qué acordamos", "Dato de demostración"], filas.map((a): Celda[] => [dia(a.fecha), a.funciono, a.seTrabo, a.carga, a.acordamos, a.esDemo]));
    }
    case "mediaciones": {
      const filas = await db.mediacion.findMany({ where, orderBy: { fecha: "asc" } });
      return aCsv(["Fecha", "Resultado", "¿Seguimiento hecho?", "Dato de demostración"], filas.map((m): Celda[] => [dia(m.fecha), RESULTADO_MEDIACION[m.resultado], m.seguimientoHecho, m.esDemo]));
    }
    case "indicadores": {
      const { contexto, indicadores } = await leerTablero(params);
      return aCsv(
        ["Id", "Objetivo", "Indicador", "Valor en el periodo", "Valor en la línea base", "Meta", "n", "Estado", "Periodo desde", "Periodo hasta"],
        indicadores.map((i): Celda[] => [
          i.id, i.objetivo, i.titulo,
          i.valor === null ? `Datos insuficientes (n < ${contexto.umbral})` : formatearValor(i.valor, i.formato, i.total),
          i.formato === "fraccion" ? "" : formatearValor(i.valorBase, i.formato),
          i.meta, i.n, ESTADOS_TEXTO[i.estado], contexto.periodo.desde, contexto.periodo.hasta,
        ]),
      );
    }
  }
}
