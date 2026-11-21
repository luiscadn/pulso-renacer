/**
 * Toda la lógica de días y semanas se hace en America/Bogota (UTC−5, sin horario de verano),
 * aunque el servidor (Render) corra en UTC.
 */
import { TZDate } from "@date-fns/tz";
import {
  addDays,
  differenceInMinutes,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";

export const ZONA = "America/Bogota";

/** Fecha actual expresada en Bogotá (es un Date; el instante es el mismo). */
export function ahoraBogota(): TZDate {
  return new TZDate(Date.now(), ZONA);
}

function enBogota(d: Date | number | string): TZDate {
  return new TZDate(new Date(d).getTime(), ZONA);
}

/** Instante de la medianoche de Bogotá del día al que pertenece `d`. */
export function inicioDiaBogota(d: Date | number | string = Date.now()): Date {
  return new Date(startOfDay(enBogota(d)).getTime());
}

/** ¿Los dos instantes caen en el mismo día calendario de Bogotá? */
export function mismoDiaBogota(a: Date, b: Date): boolean {
  return claveDia(a) === claveDia(b);
}

/** 'YYYY-MM-DD' del día en Bogotá. */
export function claveDia(d: Date | number | string): string {
  return format(enBogota(d), "yyyy-MM-dd");
}

/** Semana ISO de Bogotá, por ejemplo '2026-W48'. */
export function semanaISO(d: Date | number | string = Date.now()): string {
  const z = enBogota(d);
  return `${getISOWeekYear(z)}-W${String(getISOWeek(z)).padStart(2, "0")}`;
}

export function sumarDias(d: Date, dias: number): Date {
  return new Date(addDays(enBogota(d), dias).getTime());
}

/** Horas (con decimales) entre dos instantes; positivo si `b` es posterior a `a`. */
export function horasEntre(a: Date, b: Date): number {
  return differenceInMinutes(b, a) / 60;
}

/**
 * Convierte un instante en el Date que Prisma espera para columnas `@db.Date`:
 * medianoche UTC del día calendario **de Bogotá**.
 */
export function soloFecha(d: Date | number | string = Date.now()): Date {
  return new Date(`${claveDia(d)}T00:00:00.000Z`);
}

/** Interpreta un valor de columna `@db.Date` (medianoche UTC) como 'YYYY-MM-DD'. */
export function claveDeSoloFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Convierte 'YYYY-MM-DD' en un Date para columnas `@db.Date`. */
export function fechaDesdeClave(clave: string): Date {
  return new Date(`${clave}T00:00:00.000Z`);
}

/** «21 nov 2026». Para columnas `@db.Date` pasa `{ soloFecha: true }`. */
export function formatoCorto(d: Date, opciones: { soloFecha?: boolean } = {}): string {
  const base = opciones.soloFecha ? new TZDate(d.getTime(), "UTC") : enBogota(d);
  return format(base, "d MMM yyyy", { locale: es }).replace(".", "");
}

/** «3:00 p. m.» en Bogotá. */
export function formatoHora(d: Date): string {
  const z = enBogota(d);
  return `${format(z, "h:mm")} ${z.getHours() < 12 ? "a. m." : "p. m."}`;
}

/** «hace 2 h», «hace 5 min», «hace 3 días». */
export function formatoRelativo(d: Date, ahora: Date = new Date()): string {
  const minutos = differenceInMinutes(ahora, d);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "hace 1 día" : `hace ${dias} días`;
}

/** Plazo de respuesta de una sugerencia: fecha (solo día) + 15 días. */
export const DIAS_RESPUESTA_SUGERENCIA = 15;
export function fechaLimiteSugerencia(fecha: Date): Date {
  return new Date(fecha.getTime() + DIAS_RESPUESTA_SUGERENCIA * 86_400_000);
}

/** Días calendario (Bogotá) que faltan desde hoy hasta una fecha `@db.Date`. Negativo si ya pasó. */
export function diasRestantes(limite: Date, ahora: Date = new Date()): number {
  return Math.round((limite.getTime() - soloFecha(ahora).getTime()) / 86_400_000);
}
