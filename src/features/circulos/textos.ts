export const APARTADOS_ACTA = [
  { campo: "funciono", titulo: "Qué funcionó", ejemplo: "Ej.: El aviso del semáforo nos ahorró llamadas cruzadas entre recepción y cabinas." },
  { campo: "seTrabo", titulo: "Qué se trabó", ejemplo: "Ej.: Los sábados se juntan dos pacientes nuevas y la cabina 2 se desborda." },
  { campo: "carga", titulo: "Cómo está la carga", ejemplo: "Ej.: Moderada entre semana; pesada los sábados en la tarde." },
  { campo: "acordamos", titulo: "Qué acordamos", ejemplo: "Ej.: Revisar la agenda del sábado los viernes y avisar cambios en el canal." },
] as const;

export const PASOS_B2 = [
  "Escucha a cada parte por separado y en privado.",
  "Describe los hechos sin juicios.",
  "Busca un acuerdo entre las partes.",
  "Haz seguimiento a la semana.",
  "Escala a la propietaria solo si no hay acuerdo.",
] as const;
