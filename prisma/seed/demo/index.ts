import { db } from "../../../src/lib/db";
import { claveDia, sumarDias } from "../../../src/lib/fechas";
import { seedDemoSemaforo } from "./semaforo";
import { seedDemoBitacora } from "./bitacora";
import { seedDemoBuzon } from "./buzon";
import { seedDemoPulso } from "./pulso";
import { seedDemoCirculos } from "./circulos";

/** Borra todas las filas marcadas con esDemo=true. No toca el mapa ni los ajustes. */
export async function borrarDemo(): Promise<void> {
  const where = { esDemo: true };
  await db.$transaction([
    db.consulta.deleteMany({ where }),
    db.sugerencia.deleteMany({ where }),
    db.avisoAgenda.deleteMany({ where }),
    db.respuestaPulso.deleteMany({ where }),
    db.respuestaPulsoRoles.deleteMany({ where }),
    db.actaCirculo.deleteMany({ where }),
    db.mediacion.deleteMany({ where }),
  ]);
}

/** Carga 4 semanas de datos demo (SPEC §8). Idempotente: primero borra lo demo anterior. */
export async function seedDemo(): Promise<void> {
  await borrarDemo();
  const hoy = new Date();
  const lineaBase = {
    lineaBaseInicio: claveDia(sumarDias(hoy, -27)),
    lineaBaseFin: claveDia(sumarDias(hoy, -14)),
  };
  for (const [clave, valor] of Object.entries(lineaBase)) {
    await db.ajuste.upsert({ where: { clave }, update: { valor }, create: { clave, valor } });
  }
  await seedDemoSemaforo();
  await seedDemoBitacora();
  await seedDemoBuzon();
  await seedDemoPulso();
  await seedDemoCirculos();
}
