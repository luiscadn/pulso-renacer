import type { TipoSituacion } from "@prisma/client";
import { db } from "../../src/lib/db";
import { claveDia, sumarDias } from "../../src/lib/fechas";

type Situacion = {
  titulo: string;
  ejemplo: string;
  tipo: TipoSituacion;
  quienResuelve: string;
  tiempoEsperado: string;
  cuandoEscalar: string;
  comoHacerlo?: string;
};

/** Contenido base del mapa «¿A quién acudo?» (SPEC §7). */
export const SITUACIONES_BASE: Situacion[] = [
  {
    titulo: "Una paciente llega tarde y la siguiente cita está encima",
    ejemplo: "La paciente de las 3:00 avisa que llega 20 minutos tarde y a las 4:00 hay otra cita en la misma cabina.",
    tipo: "AGENDA",
    quienResuelve: "Recepción, según la política de impuntualidad",
    tiempoEsperado: "Inmediato",
    cuandoEscalar: "Solo si la paciente rechaza la solución.",
    comoHacerlo: "Aviso del semáforo amarillo o rojo.",
  },
  {
    titulo: "Se agota un producto que está en promoción",
    ejemplo: "Se acabó el sérum de la promoción del mes y hay pacientes preguntando.",
    tipo: "PRODUCTO_PROMOCION",
    quienResuelve: "Administración",
    tiempoEsperado: "El mismo día",
    cuandoEscalar: "No se escala.",
    comoHacerlo: "Publicar #Agotado en «Renacer al Día» con el producto sustituto.",
  },
  {
    titulo: "Desacuerdo con recepción o con una compañera",
    ejemplo: "No estoy de acuerdo con cómo se reorganizó mi agenda y me siento incómoda hablándolo.",
    tipo: "CONFLICTO",
    quienResuelve: "La administradora media en privado",
    tiempoEsperado: "En la semana",
    cuandoEscalar: "Si no hay acuerdo. Si el conflicto involucra a la administradora, media la propietaria.",
    comoHacerlo: "Protocolo de mediación de 5 pasos; el tema de fondo se lleva al círculo.",
  },
  {
    titulo: "Quiero proponer una mejora (por ejemplo, un protocolo de bioseguridad)",
    ejemplo: "Se me ocurre una forma más rápida y segura de desinfectar la cabina entre citas.",
    tipo: "PROTOCOLO",
    quienResuelve: "Administración valida",
    tiempoEsperado: "Respuesta en 15 días o menos",
    cuandoEscalar: "La propietaria aprueba si implica inversión o cambia un procedimiento clínico.",
    comoHacerlo: "Buzón «Propusiste / Hicimos».",
  },
  {
    titulo: "Ingresa una nueva prestadora",
    ejemplo: "El sábado empieza una prestadora por horas y no conoce los protocolos.",
    tipo: "OTRO",
    quienResuelve: "La propietaria comunica el ingreso y la administración hace la inducción",
    tiempoEsperado: "El primer día",
    cuandoEscalar: "No aplica.",
    comoHacerlo: "Inducción de 15 minutos con el kit de cabina y este mapa.",
  },
  {
    titulo: "Tengo una duda sobre un protocolo de cabina o un producto",
    ejemplo: "No recuerdo el tiempo de exposición de un producto en un tratamiento.",
    tipo: "PROTOCOLO",
    quienResuelve: "Primero el kit de cabina; si no está, la administradora",
    tiempoEsperado: "El mismo día",
    cuandoEscalar: "Si el caso es clínico o no está en el protocolo.",
  },
  {
    titulo: "No sé si una promoción o un precio siguen vigentes",
    ejemplo: "Una paciente pregunta si el paquete de masajes todavía tiene descuento.",
    tipo: "PRODUCTO_PROMOCION",
    quienResuelve: "El canal «Renacer al Día» (#Promo, #Precio); si no está, la administración",
    tiempoEsperado: "El mismo día",
    cuandoEscalar: "No se escala.",
  },
  {
    titulo: "Necesito un permiso o un cambio de turno",
    ejemplo: "Tengo una cita médica el jueves en la tarde y necesito cambiar el turno.",
    tipo: "PERMISO_TURNO",
    quienResuelve: "Por definir en el taller de roles",
    tiempoEsperado: "Por definir",
    cuandoEscalar: "Por definir.",
  },
];

export function ajustesPorDefecto(hoy: Date = new Date()): Record<string, string> {
  return {
    lineaBaseInicio: claveDia(hoy),
    lineaBaseFin: claveDia(sumarDias(hoy, 13)),
    umbralAnonimato: "3",
    metaCirculos: "6",
    cabinas: "Cabina 1,Cabina 2,Cabina 3,Láser",
    kitCabinasActualizadas: "0",
    kitCabinasTotal: "4",
  };
}

/** Idempotente: crea solo los ajustes que faltan y siembra el mapa solo si está vacío. */
export async function seedBase(): Promise<void> {
  for (const [clave, valor] of Object.entries(ajustesPorDefecto())) {
    await db.ajuste.upsert({ where: { clave }, update: {}, create: { clave, valor } });
  }
  if ((await db.situacionMapa.count()) === 0) {
    await db.situacionMapa.createMany({
      data: SITUACIONES_BASE.map((s, i) => ({ ...s, orden: i + 1, porValidar: true, activo: true })),
    });
  }
}
