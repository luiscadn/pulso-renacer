import { claveDeSoloFecha, claveDia, fechaDesdeClave, semanaISO } from "@/lib/fechas";

/** Nombre de la cookie que marca «ya respondí esta semana» (control suave, sin datos personales). */
export function cookiePulso(semana: string): string {
  return `pr_pulso_${semana}`;
}
export function cookiePulsoRoles(semana: string): string {
  return `pr_pulso_roles_${semana}`;
}

/** Semana ISO de Bogotá del momento dado. */
export function semanaActual(d: Date | number = Date.now()): string {
  return semanaISO(d);
}

/** Próximo lunes (después de hoy, en Bogotá) como 'YYYY-MM-DD'. Si hoy es lunes, el siguiente. */
export function proximoLunes(d: Date | number = Date.now()): string {
  const hoy = fechaDesdeClave(claveDia(d));
  const diaIso = hoy.getUTCDay() === 0 ? 7 : hoy.getUTCDay();
  return claveDeSoloFecha(new Date(hoy.getTime() + (8 - diaIso) * 86_400_000));
}

/** «lunes 24 de noviembre». */
export function textoFechaLunes(clave: string): string {
  return fechaDesdeClave(clave).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
