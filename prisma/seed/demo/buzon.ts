// Datos demo del módulo buzón (SPEC §8). Cada fila lleva esDemo: true.
import { db } from "../../../src/lib/db";
import { soloFecha, sumarDias } from "../../../src/lib/fechas";

export async function seedDemoBuzon(): Promise<void> {
  const hoy = new Date();
  const dia = (atras: number) => soloFecha(sumarDias(hoy, -atras));
  type Datos = Parameters<typeof db.sugerencia.create>[0]["data"];
  const filas: Datos[] = [
    {
      fecha: dia(26), categoria: "PROTOCOLOS", estado: "IMPLEMENTADA", publicada: true,
      texto: "Propongo una ficha corta de bioseguridad para dejar en cada cabina: qué se desinfecta entre paciente y paciente y con qué producto.",
      resumenPublico: "Una ficha de bioseguridad a la vista en cada cabina.",
      respuesta: "Creamos la ficha de bioseguridad del kit de cabina.",
      respondidaEn: dia(16),
    },
    {
      fecha: dia(24), categoria: "AGENDA", estado: "IMPLEMENTADA", publicada: true,
      texto: "Los sábados en la mañana recepción se llena con llegadas y llamadas al tiempo. Sería bueno tener apoyo en esas horas.",
      resumenPublico: "Apoyo en recepción en las horas pico de los sábados.",
      respuesta: "Desde este mes una compañera de planta acompaña recepción los sábados de 9 a 11 a. m.",
      respondidaEn: dia(14),
    },
    {
      fecha: dia(22), categoria: "INSUMOS", estado: "IMPLEMENTADA", publicada: true,
      texto: "Varias veces se han acabado las puntas y el gel del láser a mitad de semana. Una revisión fija evitaría cancelaciones.",
      resumenPublico: "Revisar la reposición de insumos de láser antes de que se agoten.",
      respuesta: "Quedó una revisión de insumos de láser todos los lunes, con lista de mínimos.",
      respondidaEn: dia(12),
    },
    {
      fecha: dia(20), categoria: "AGENDA", estado: "IMPLEMENTADA", publicada: true,
      texto: "Cuando toca reprogramar a una paciente cada una escribe el mensaje a su manera. Una plantilla ayudaría.",
      resumenPublico: "Una plantilla de mensaje para reprogramar citas.",
      respuesta: "Agregamos la plantilla de reprogramación al semáforo de agendas.",
      respondidaEn: dia(10),
    },
    {
      fecha: dia(23), categoria: "CABINA", estado: "NO_IMPLEMENTADA", publicada: true,
      texto: "La rotación de toallas es desordenada y a veces no alcanzan. Se podría llevar un conteo por turno.",
      resumenPublico: "Organizar la rotación de toallas por turno.",
      respuesta: "Lo revisamos y por ahora la lavandería externa no permite más entregas. Ajustamos el pedido semanal y lo volvemos a mirar en dos meses.",
      respondidaEn: dia(2),
    },
    {
      fecha: dia(18), categoria: "OTRO", estado: "RECIBIDA", publicada: false,
      texto: "Sería lindo tener un espacio para tomar el almuerzo con calma, sin atender el celular de la recepción.",
    },
    {
      fecha: dia(6), categoria: "PROTOCOLOS", estado: "EN_REVISION", publicada: false, firma: "Una compañera de cabina",
      texto: "Pienso que el protocolo de primera consulta se podría explicar por escrito para que todas lo hagamos igual.",
    },
    {
      fecha: dia(1), categoria: "CABINA", estado: "RECIBIDA", publicada: false,
      texto: "El aire de la cabina 2 enfría demasiado y las pacientes piden cobija. ¿Se puede revisar el aire acondicionado?",
    },
  ];
  for (const f of filas) await db.sugerencia.create({ data: { ...f, esDemo: true } });
}
