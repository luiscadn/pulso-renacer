import type {
  CategoriaSugerencia,
  ColorSemaforo,
  Decisor,
  Destinatario,
  EstadoSugerencia,
  MotivoAviso,
  MotivoEscalamiento,
  ResultadoMediacion,
  RolConsultante,
  TiempoRespuesta,
  TipoSituacion,
} from "@prisma/client";

/** Etiquetas visibles en español para todos los enums. Nunca muestres el valor crudo. */
export const ROL_CONSULTANTE: Record<RolConsultante, string> = {
  CABINA: "Cabina",
  RECEPCION: "Recepción",
  PRESTADORA: "Prestadora",
};

export const TIPO_SITUACION: Record<TipoSituacion, string> = {
  AGENDA: "Agenda",
  PRODUCTO_PROMOCION: "Producto o promoción",
  PROTOCOLO: "Protocolo",
  CONFLICTO: "Conflicto",
  PERMISO_TURNO: "Permiso o turno",
  OTRO: "Otro",
};

export const DESTINATARIO: Record<Destinatario, string> = {
  PROPIETARIA: "Propietaria",
  ADMINISTRADORA: "Administradora",
  SECRETARIA: "Secretaria",
  RECEPCION: "Recepción",
  COLABORADORA_ANTIGUA: "Colaboradora antigua",
};

export const DECISOR: Record<Decisor, string> = {
  ROL_DELEGADO: "Rol delegado",
  PROPIETARIA: "Propietaria",
};

export const TIEMPO_RESPUESTA: Record<TiempoRespuesta, string> = {
  MISMO_DIA: "El mismo día",
  MENOS_24H: "Menos de 24 horas",
  MAS_24H: "Más de 24 horas",
  SIN_RESPUESTA: "Sin respuesta",
};

export const MOTIVO_ESCALAMIENTO: Record<MotivoEscalamiento, string> = {
  NO_CORRESPONDIA: "No le correspondía a ese rol",
  ROL_PREFIRIO_NO_DECIDIR: "El rol prefirió no decidir",
  PIDIO_HABLAR_CON_DUENA: "Pidió hablar con la dueña",
  OTRO: "Otro motivo",
};

export const CATEGORIA_SUGERENCIA: Record<CategoriaSugerencia, string> = {
  CABINA: "Cabina",
  AGENDA: "Agenda",
  INSUMOS: "Insumos",
  PROTOCOLOS: "Protocolos",
  OTRO: "Otro",
};

export const ESTADO_SUGERENCIA: Record<EstadoSugerencia, string> = {
  RECIBIDA: "Recibida",
  EN_REVISION: "En revisión",
  IMPLEMENTADA: "Implementada",
  NO_IMPLEMENTADA: "No implementada",
};

export const COLOR_SEMAFORO: Record<ColorSemaforo, string> = {
  VERDE: "Verde (a tiempo)",
  AMARILLO: "Amarillo (retraso de hasta 15 min)",
  ROJO: "Rojo (retraso mayor o reprogramación)",
};

export const COLOR_SEMAFORO_CORTO: Record<ColorSemaforo, string> = {
  VERDE: "Verde",
  AMARILLO: "Amarillo",
  ROJO: "Rojo",
};

export const MOTIVO_AVISO: Record<MotivoAviso, string> = {
  RETRASO_PACIENTE: "Retraso de la paciente",
  REPROGRAMACION: "Reprogramación",
  CABINA_OCUPADA: "Cabina ocupada",
  OTRO: "Otro",
};

export const RESULTADO_MEDIACION: Record<ResultadoMediacion, string> = {
  EN_CURSO: "En curso",
  ACUERDO: "Acuerdo",
  SIN_ACUERDO_ESCALADA: "Sin acuerdo (escalada)",
};

export const ROL_SESION: Record<"equipo" | "gestion", string> = {
  equipo: "Equipo",
  gestion: "Gestión",
};

/** Afirmaciones del pulso (texto exacto de SPEC §6.5). p7 se responde en /gestion/pulso-roles. */
export const PREGUNTAS_PULSO = {
  p1: "Cuando tengo una duda operativa sé con claridad a quién acudir antes de recurrir a la propietaria.",
  p2: "Las instrucciones de la administración y la recepción son claras, oportunas y respetadas.",
  p3: "Cuento con acceso diario y visible a promociones vigentes, productos agotados y protocolos de cabina.",
  p4: "La comunicación entre recepción y cabinas permite gestionar imprevistos sin sobrecarga ni retrasos.",
  p5: "Siento tranquilidad y apertura para expresar una inconformidad o desacuerdo sin temor a repercusiones.",
  p6: "Cuando consulto a administración o recepción, recibo una respuesta que resuelve mi situación.",
  p7: "Puedo tomar las decisiones de mi cargo sin que sean revertidas.",
} as const;
export type PreguntaPulso = keyof typeof PREGUNTAS_PULSO;

export const ESCALA_LIKERT = {
  min: "Total desacuerdo",
  max: "Total acuerdo",
} as const;
