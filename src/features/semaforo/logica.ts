/** Lógica pura del semáforo de agendas (sin base de datos), para poder probarla. */
import type { ColorSemaforo, MotivoAviso } from "@prisma/client";
import { claveDia } from "@/lib/fechas";

export const MINUTOS_ANTICIPACION_MINIMA = 15;

export type AccionPropuesta = "ESPERAR" | "INICIAR_MAS_TARDE" | "REPROGRAMAR" | "CAMBIAR_CABINA";

export const ACCION_PROPUESTA: Record<AccionPropuesta, string> = {
  ESPERAR: "Esperar",
  INICIAR_MAS_TARDE: "Iniciar más tarde y acortar",
  REPROGRAMAR: "Reprogramar",
  CAMBIAR_CABINA: "Cambiar de cabina",
};

export type DatosAviso = {
  color: ColorSemaforo;
  cabina: string;
  /** 'HH:mm' (24 h), como lo entrega <input type="time">. */
  horaCita: string;
  minutosRetraso?: number | null;
  motivo: MotivoAviso;
  accion?: AccionPropuesta | null;
  iniciales?: string | null;
};

/** 'HH:mm' → «3:00 p. m.». */
export function hora12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

function sumarMinutos(hhmm: string, minutos: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (((h * 60 + m + minutos) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const ENCABEZADO: Record<ColorSemaforo, string> = {
  VERDE: "🟢 VERDE",
  AMARILLO: "🟡 AMARILLO",
  ROJO: "🔴 ROJO",
};

function limpiarIniciales(iniciales?: string | null): string {
  return (iniciales ?? "").trim();
}

function frase(d: DatosAviso, paciente: string, min: number): string {
  if (d.color === "VERDE") return `${paciente} llega a tiempo.`;
  const retraso = min > 0 ? `~${min} min` : "unos minutos";
  switch (d.motivo) {
    case "RETRASO_PACIENTE":
      return min > 0 ? `${paciente} llega ${retraso} tarde.` : `${paciente} llega tarde.`;
    case "REPROGRAMACION":
      return `${paciente} necesita reprogramar la cita.`;
    case "CABINA_OCUPADA":
      return `La cabina sigue ocupada (${retraso}).`;
    default:
      return `Hay un imprevisto (${retraso}).`;
  }
}

function propuesta(d: DatosAviso, min: number): string | null {
  if (d.color === "VERDE" || !d.accion) return null;
  switch (d.accion) {
    case "ESPERAR":
      return "esperar";
    case "INICIAR_MAS_TARDE":
      return min > 0 ? `iniciar ${hora12(sumarMinutos(d.horaCita, min))} y acortar ${min} min` : "iniciar más tarde y acortar";
    case "REPROGRAMAR":
      return "reprogramar";
    case "CAMBIAR_CABINA":
      return "cambiar de cabina";
  }
}

/**
 * Arma el texto del aviso para WhatsApp. Función pura.
 * Ej.: «🟡 AMARILLO · Cabina 2 · Cita 3:00 p. m. · Paciente M. R. llega ~10 min tarde. Propuesta: iniciar 3:10 p. m. y acortar 10 min. Cabina, confirma con 👍»
 */
export function generarMensaje(d: DatosAviso): string {
  const ini = limpiarIniciales(d.iniciales);
  const paciente = ini ? `Paciente ${ini}` : "La paciente";
  const min = Math.max(0, Math.round(d.minutosRetraso ?? 0));
  const partes = [ENCABEZADO[d.color], d.cabina, `Cita ${hora12(d.horaCita)}`];
  const prop = propuesta(d, min);
  const cuerpo = frase(d, paciente, min) + (prop ? ` Propuesta: ${prop}.` : "");
  partes.push(`${cuerpo} Cabina, confirma con 👍`);
  return partes.join(" · ");
}

/**
 * Minutos entre `ahora` y la hora de la cita de HOY en Bogotá. Mínimo 0 (una cita que ya pasó da 0).
 */
export function calcularAnticipacion(horaCita: string, ahora: Date = new Date()): number {
  const cita = new Date(`${claveDia(ahora)}T${horaCita}:00-05:00`).getTime();
  if (Number.isNaN(cita)) return 0;
  return Math.max(0, Math.round((cita - ahora.getTime()) / 60_000));
}

export function poca(minutosAnticipacion: number): boolean {
  return minutosAnticipacion < MINUTOS_ANTICIPACION_MINIMA;
}

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
}
