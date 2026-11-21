// Datos demo del módulo semaforo (SPEC §8). Marca cada fila con esDemo: true.
import type { ColorSemaforo, MotivoAviso } from "@prisma/client";
import { db } from "../../../src/lib/db";
import { sumarDias } from "../../../src/lib/fechas";

type Fila = { color: ColorSemaforo; motivo: MotivoAviso; retraso: number | null; antic: number };

// Semanas 1–2: ~50 % con ≥ 15 min. Semanas 3–4: ~75 %. (6 avisos por semana, 25 en total.)
const SEMANAS: Fila[][] = [
  [
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 10, antic: 25 },
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 15, antic: 5 },
    { color: "ROJO", motivo: "REPROGRAMACION", retraso: null, antic: 40 },
    { color: "VERDE", motivo: "OTRO", retraso: null, antic: 8 },
    { color: "AMARILLO", motivo: "CABINA_OCUPADA", retraso: 10, antic: 3 },
    { color: "ROJO", motivo: "RETRASO_PACIENTE", retraso: 30, antic: 20 },
  ],
  [
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 5, antic: 18 },
    { color: "AMARILLO", motivo: "CABINA_OCUPADA", retraso: 10, antic: 0 },
    { color: "ROJO", motivo: "REPROGRAMACION", retraso: null, antic: 60 },
    { color: "VERDE", motivo: "OTRO", retraso: null, antic: 10 },
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 15, antic: 30 },
    { color: "ROJO", motivo: "OTRO", retraso: 25, antic: 12 },
  ],
  [
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 10, antic: 35 },
    { color: "VERDE", motivo: "OTRO", retraso: null, antic: 20 },
    { color: "AMARILLO", motivo: "CABINA_OCUPADA", retraso: 5, antic: 15 },
    { color: "ROJO", motivo: "REPROGRAMACION", retraso: null, antic: 45 },
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 10, antic: 6 },
  ],
  [
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 10, antic: 30 },
    { color: "VERDE", motivo: "OTRO", retraso: null, antic: 25 },
    { color: "AMARILLO", motivo: "RETRASO_PACIENTE", retraso: 15, antic: 50 },
    { color: "ROJO", motivo: "REPROGRAMACION", retraso: null, antic: 90 },
    { color: "AMARILLO", motivo: "CABINA_OCUPADA", retraso: 10, antic: 9 },
    { color: "ROJO", motivo: "RETRASO_PACIENTE", retraso: 40, antic: 11 },
    { color: "VERDE", motivo: "OTRO", retraso: null, antic: 16 },
  ],
];

export async function seedDemoSemaforo(): Promise<void> {
  const hoy = new Date();
  const datos = SEMANAS.flatMap((filas, s) =>
    filas.map((f, i) => {
      // Semana 0 = la más antigua (hace ~27 días); cada aviso un día distinto dentro de su semana.
      const dias = 27 - (s * 7 + (i % 7));
      const dia = sumarDias(hoy, -dias);
      const creadoEn = new Date(dia.getTime());
      creadoEn.setUTCHours(14 + (i % 5), (i * 11) % 60, 0, 0); // entre 9 a. m. y 2 p. m. en Bogotá
      return { creadoEn, color: f.color, motivo: f.motivo, minutosRetraso: f.retraso, minutosAnticipacion: f.antic, esDemo: true };
    }),
  );
  await db.avisoAgenda.createMany({ data: datos });
}
