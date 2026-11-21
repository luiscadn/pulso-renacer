// Datos demo de la bitácora (SPEC §8): ~60 consultas en 4 semanas con mejora gradual.
import type { Decisor, Destinatario, MotivoEscalamiento, RolConsultante, TiempoRespuesta, TipoSituacion } from "@prisma/client";
import { db } from "../../../src/lib/db";
import { claveDia, sumarDias } from "../../../src/lib/fechas";

// Generador pseudoaleatorio determinista: la demo es siempre igual.
function crearAzar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Perfil = {
  propietaria: number; // % dirigidas a la propietaria
  escalada: number;
  sinRespuesta: number;
  tiempos: [number, number, number]; // reparto de MISMO_DIA, MENOS_24H, MAS_24H entre las respondidas
  delegado: number;
  revertida: number; // % de las decididas por un rol delegado
};

// Semanas 1–2: línea base. Semanas 3–4: mejora gradual, sin llegar aún a todas las metas.
const BASE: Perfil = { propietaria: 0.7, escalada: 0.6, sinRespuesta: 0.25, tiempos: [0.4, 0.33, 0.27], delegado: 0.35, revertida: 0.3 };
const MEJOR: Perfil = { propietaria: 0.4, escalada: 0.35, sinRespuesta: 0.12, tiempos: [0.5, 0.36, 0.14], delegado: 0.6, revertida: 0.1 };

export async function seedDemoBitacora(): Promise<void> {
  const azar = crearAzar(20260);
  const elegir = <T>(pesos: [T, number][]): T => {
    const total = pesos.reduce((a, [, p]) => a + p, 0);
    let r = azar() * total;
    for (const [v, p] of pesos) if ((r -= p) < 0) return v;
    return pesos[0][0];
  };
  const tipos: [TipoSituacion, number][] = [
    ["AGENDA", 30], ["PRODUCTO_PROMOCION", 28], ["PROTOCOLO", 14], ["PERMISO_TURNO", 12], ["CONFLICTO", 8], ["OTRO", 8],
  ];
  const quienes: [RolConsultante, number][] = [["CABINA", 40], ["RECEPCION", 35], ["PRESTADORA", 25]];
  const otros: [Destinatario, number][] = [["ADMINISTRADORA", 45], ["SECRETARIA", 20], ["RECEPCION", 20], ["COLABORADORA_ANTIGUA", 15]];
  const motivos: [MotivoEscalamiento, number][] = [
    ["NO_CORRESPONDIA", 35], ["ROL_PREFIRIO_NO_DECIDIR", 25], ["PIDIO_HABLAR_CON_DUENA", 30], ["OTRO", 10],
  ];

  const ahora = new Date();
  const hora = (diasAtras: number, h: number, min = 0) =>
    new Date(`${claveDia(sumarDias(ahora, -diasAtras))}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00-05:00`);
  const MS_H = 3_600_000;

  const filas = [];
  // 28 consultas por mitad: semanas 1–2 (hace 27..14 días) y 3–4 (hace 13..1 días).
  for (const [perfil, desde, hasta] of [[BASE, 14, 27], [MEJOR, 1, 13]] as const) {
    for (let i = 0; i < 28; i++) {
      const diasAtras = desde + Math.floor(azar() * (hasta - desde + 1));
      const sin = azar() < perfil.sinRespuesta;
      let tiempo: TiempoRespuesta = sin
        ? "SIN_RESPUESTA"
        : elegir<TiempoRespuesta>([["MISMO_DIA", perfil.tiempos[0]], ["MENOS_24H", perfil.tiempos[1]], ["MAS_24H", perfil.tiempos[2]]]);
      let abiertaEn: Date;
      let cerradaEn: Date;
      const armar = () => {
        if (tiempo === "MISMO_DIA") {
          abiertaEn = hora(diasAtras, 8 + Math.floor(azar() * 6), Math.floor(azar() * 60));
          cerradaEn = new Date(abiertaEn.getTime() + (1 + Math.floor(azar() * 3)) * MS_H);
        } else if (tiempo === "MENOS_24H") {
          abiertaEn = hora(diasAtras, 15 + Math.floor(azar() * 3), Math.floor(azar() * 60));
          cerradaEn = new Date(abiertaEn.getTime() + (16 + Math.floor(azar() * 5)) * MS_H);
        } else if (tiempo === "MAS_24H") {
          abiertaEn = hora(diasAtras, 9 + Math.floor(azar() * 8), 0);
          cerradaEn = new Date(abiertaEn.getTime() + (26 + Math.floor(azar() * 34)) * MS_H);
        } else {
          abiertaEn = hora(diasAtras, 9 + Math.floor(azar() * 8), 0);
          cerradaEn = new Date(abiertaEn.getTime() + (28 + Math.floor(azar() * 20)) * MS_H);
        }
      };
      armar();
      if (cerradaEn! > new Date(ahora.getTime() - MS_H)) {
        tiempo = sin ? "SIN_RESPUESTA" : "MISMO_DIA"; // lo reciente se cierra el mismo día
        if (sin) {
          abiertaEn = hora(diasAtras + 3, 10);
          cerradaEn = new Date(abiertaEn.getTime() + 30 * MS_H);
        } else armar();
      }
      const aPropietaria = azar() < perfil.propietaria;
      const delegado = azar() < perfil.delegado;
      const escalada = azar() < perfil.escalada;
      filas.push({
        abiertaEn: abiertaEn!,
        cerradaEn: cerradaEn!,
        quienConsulta: elegir(quienes),
        tipo: elegir(tipos),
        dirigidaA: aPropietaria ? ("PROPIETARIA" as const) : elegir(otros),
        recibioRespuesta: tiempo !== "SIN_RESPUESTA",
        tiempoRespuesta: tiempo,
        decidio: (delegado ? "ROL_DELEGADO" : "PROPIETARIA") as Decisor,
        escalada,
        motivoEscalamiento: escalada ? elegir(motivos) : null,
        revertida: delegado && azar() < perfil.revertida,
        revertidaPor: null as Destinatario | null,
        esDemo: true,
      });
    }
  }
  for (const f of filas) if (f.revertida) f.revertidaPor = "PROPIETARIA";

  // Abiertas: 3 recientes y 1 de más de 24 h.
  const abiertas: [number, RolConsultante, TipoSituacion, Destinatario][] = [
    [1, "RECEPCION", "AGENDA", "ADMINISTRADORA"],
    [3, "CABINA", "PRODUCTO_PROMOCION", "PROPIETARIA"],
    [5, "PRESTADORA", "PROTOCOLO", "COLABORADORA_ANTIGUA"],
    [30, "CABINA", "PERMISO_TURNO", "PROPIETARIA"],
  ];
  for (const [h, quienConsulta, tipo, dirigidaA] of abiertas) {
    filas.push({
      abiertaEn: new Date(ahora.getTime() - h * MS_H), cerradaEn: null, quienConsulta, tipo, dirigidaA,
      recibioRespuesta: null, tiempoRespuesta: null, decidio: null, escalada: false, motivoEscalamiento: null,
      revertida: false, revertidaPor: null, esDemo: true,
    } as never);
  }
  await db.consulta.createMany({ data: filas as never });
}
