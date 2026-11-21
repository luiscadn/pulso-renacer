// Datos demo del módulo pulso (SPEC §8): 16 respuestas en 4 semanas (4 por semana) + 4 de roles.
// Los promedios de las semanas 1–2 imitan la encuesta 2 (p1≈4,75 · p2≈4,0 · p3≈3,75 · p4≈3,5 · p5≈3,25 · p6≈3,4)
// y mejoran de forma gradual en las semanas 3–4 (p3≈4,25 · p4≈4,0 · p5≈3,75 · p6≈4,0).
import { db } from "../../../src/lib/db";
import { semanaISO, soloFecha, sumarDias } from "../../../src/lib/fechas";

type Ps = { p1: number[]; p2: number[]; p3: number[]; p4: number[]; p5: number[]; p6: number[] };

const SEMANAS: Ps[] = [
  { p1: [5, 5, 5, 4], p2: [4, 4, 4, 4], p3: [4, 4, 4, 3], p4: [4, 3, 4, 3], p5: [3, 3, 4, 3], p6: [4, 3, 3, 3] },
  { p1: [5, 5, 4, 5], p2: [4, 5, 4, 3], p3: [3, 4, 4, 4], p4: [3, 4, 4, 3], p5: [3, 3, 3, 4], p6: [3, 4, 3, 4] },
  { p1: [5, 5, 4, 5], p2: [4, 4, 4, 4], p3: [4, 5, 4, 4], p4: [4, 4, 4, 4], p5: [4, 3, 4, 4], p6: [4, 4, 4, 4] },
  { p1: [5, 5, 5, 4], p2: [4, 4, 3, 5], p3: [4, 4, 5, 4], p4: [4, 4, 4, 4], p5: [4, 4, 3, 4], p6: [4, 4, 4, 4] },
];
const ROLES = [3, 4, 4, 3];

export async function seedDemoPulso(): Promise<void> {
  const hoy = new Date();
  for (const [k, s] of SEMANAS.entries()) {
    const dia = sumarDias(hoy, -(SEMANAS.length - 1 - k) * 7);
    const data = [0, 1, 2, 3].map((i) => ({
      semana: semanaISO(dia),
      fecha: soloFecha(dia),
      p1: s.p1[i],
      p2: s.p2[i],
      p3: s.p3[i],
      p4: s.p4[i],
      p5: s.p5[i],
      p6: s.p6[i],
      esDemo: true,
    }));
    await db.respuestaPulso.createMany({ data });
    await db.respuestaPulsoRoles.create({
      data: { semana: semanaISO(dia), fecha: soloFecha(dia), p7: ROLES[k], esDemo: true },
    });
  }
}
