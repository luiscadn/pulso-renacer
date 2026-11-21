import { db } from "@/lib/db";
import { filtroDemo } from "@/lib/demo";
import { leerAjustes } from "@/lib/ajustes";
import { claveDia, fechaDesdeClave, inicioDiaBogota, sumarDias } from "@/lib/fechas";
import { UMBRAL_POR_DEFECTO } from "@/lib/privacidad";
import {
  calcularIndicadores,
  tendenciaSemanal,
  type Contexto,
  type Filas,
  type Indicador,
  type PuntoTendencia,
  type Rango,
} from "./metricas";
import { resolverPeriodo, type OpcionPeriodo } from "./periodo";

const entero = (v: string | undefined, porDefecto: number, minimo = 0) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= minimo ? n : porDefecto;
};

export type Tablero = {
  opcion: OpcionPeriodo;
  contexto: Contexto;
  indicadores: Indicador[];
  tendencias: Record<"I1" | "I2" | "I12", PuntoTendencia[]>;
};

/** Trae solo las columnas necesarias, con filtroDemo(), desde el inicio más antiguo entre P, B e I15. */
export async function leerFilas(desdeClave: string): Promise<Filas> {
  const where = filtroDemo();
  const instante = { gte: inicioDiaBogota(fechaDesdeClave(desdeClave).getTime() + 12 * 3_600_000) };
  const fecha = { gte: fechaDesdeClave(desdeClave) };
  const [consultas, sugerencias, avisos, pulsos, pulsosRoles, actas, mediaciones] = await Promise.all([
    db.consulta.findMany({
      where: { ...where, abiertaEn: instante },
      select: { abiertaEn: true, cerradaEn: true, tipo: true, dirigidaA: true, recibioRespuesta: true, tiempoRespuesta: true, decidio: true, escalada: true, motivoEscalamiento: true, revertida: true },
    }),
    db.sugerencia.findMany({ where: { ...where, fecha }, select: { fecha: true, respondidaEn: true } }),
    db.avisoAgenda.findMany({ where: { ...where, creadoEn: instante }, select: { creadoEn: true, minutosAnticipacion: true } }),
    db.respuestaPulso.findMany({ where: { ...where, fecha }, select: { fecha: true, p1: true, p2: true, p3: true, p4: true, p5: true, p6: true } }),
    db.respuestaPulsoRoles.findMany({ where: { ...where, fecha }, select: { fecha: true, p7: true } }),
    db.actaCirculo.findMany({ where: { ...where, fecha }, select: { fecha: true } }),
    db.mediacion.findMany({ where: { ...where, fecha }, select: { fecha: true, resultado: true, seguimientoHecho: true } }),
  ]);
  return { consultas, sugerencias, avisos, pulsos, pulsosRoles, actas, mediaciones };
}

export async function leerTablero(params: { p?: string; desde?: string; hasta?: string }): Promise<Tablero> {
  const hoy = new Date();
  const hoyClave = claveDia(hoy);
  const aj = await leerAjustes();
  const lineaBase: Rango = {
    desde: aj.lineaBaseInicio ?? hoyClave,
    hasta: aj.lineaBaseFin ?? claveDia(sumarDias(hoy, 13)),
  };
  const { opcion, periodo } = resolverPeriodo(params, hoy);
  const contexto: Contexto = {
    periodo,
    lineaBase,
    hoy,
    umbral: entero(aj.umbralAnonimato, UMBRAL_POR_DEFECTO, 1),
    ajustes: {
      metaCirculos: entero(aj.metaCirculos, 6, 1),
      kitCabinasActualizadas: entero(aj.kitCabinasActualizadas, 0),
      kitCabinasTotal: entero(aj.kitCabinasTotal, 4),
      lineaBaseInicio: lineaBase.desde,
    },
  };
  const masAntigua = [periodo.desde, lineaBase.desde].sort()[0];
  const filas = await leerFilas(masAntigua);
  return {
    opcion,
    contexto,
    indicadores: calcularIndicadores(filas, contexto),
    tendencias: {
      I1: tendenciaSemanal(filas, "I1", contexto),
      I2: tendenciaSemanal(filas, "I2", contexto),
      I12: tendenciaSemanal(filas, "I12", contexto),
    },
  };
}
