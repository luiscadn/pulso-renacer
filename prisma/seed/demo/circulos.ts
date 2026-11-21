// Datos demo de círculos y mediaciones (SPEC §8): 2 actas y 5 mediaciones (3 cerradas dentro de los últimos 14 días para que I14 no quede en «insuficiente»). Sin nombres de personas.
import { db } from "../../../src/lib/db";
import { soloFecha, sumarDias } from "../../../src/lib/fechas";

export async function seedDemoCirculos(): Promise<void> {
  const hoy = new Date();
  await db.actaCirculo.createMany({
    data: [
      {
        fecha: soloFecha(sumarDias(hoy, -20)),
        funciono: "Nos gustó empezar el día revisando juntas la agenda. Las citas de la mañana salieron más ordenadas.",
        seTrabo: "Cuando una paciente llega tarde, recepción y cabina se enteran por mensajes sueltos y se cruzan las indicaciones.",
        carga: "Moderada entre semana. Las prestadoras por horas sienten que los sábados llegan muchas citas juntas.",
        acordamos: "Probar el aviso estandarizado de retraso por semáforo y revisar en el próximo círculo cómo nos fue.",
        esDemo: true,
      },
      {
        fecha: soloFecha(sumarDias(hoy, -6)),
        funciono: "El semáforo de agendas ya se usa en casi todos los retrasos. Recepción dice que se pierde menos tiempo.",
        seTrabo: "Los sábados siguen pesados: dos pacientes nuevas a la misma hora y una sola cabina libre.",
        carga: "Pesada los sábados en la tarde; tranquila de lunes a jueves.",
        acordamos:
          "Revisar la agenda del sábado el viernes y repartir mejor las citas. Avisar con el semáforo al menos 15 minutos antes. Volver a hablar de la carga del sábado en el próximo círculo.",
        esDemo: true,
      },
    ],
  });
  await db.mediacion.createMany({
    data: [
      { fecha: soloFecha(sumarDias(hoy, -22)), resultado: "ACUERDO", seguimientoHecho: true, esDemo: true },
      { fecha: soloFecha(sumarDias(hoy, -12)), resultado: "ACUERDO", seguimientoHecho: true, esDemo: true },
      { fecha: soloFecha(sumarDias(hoy, -10)), resultado: "ACUERDO", seguimientoHecho: true, esDemo: true },
      { fecha: soloFecha(sumarDias(hoy, -8)), resultado: "ACUERDO", seguimientoHecho: false, esDemo: true },
      { fecha: soloFecha(sumarDias(hoy, -3)), resultado: "EN_CURSO", seguimientoHecho: false, esDemo: true },
    ],
  });
}
