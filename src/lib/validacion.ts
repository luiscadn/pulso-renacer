import {
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
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";

// Enums de Prisma como esquemas zod
export const zRolConsultante = z.enum(RolConsultante);
export const zTipoSituacion = z.enum(TipoSituacion);
export const zDestinatario = z.enum(Destinatario);
export const zDecisor = z.enum(Decisor);
export const zTiempoRespuesta = z.enum(TiempoRespuesta);
export const zMotivoEscalamiento = z.enum(MotivoEscalamiento);
export const zCategoriaSugerencia = z.enum(CategoriaSugerencia);
export const zEstadoSugerencia = z.enum(EstadoSugerencia);
export const zColorSemaforo = z.enum(ColorSemaforo);
export const zMotivoAviso = z.enum(MotivoAviso);
export const zResultadoMediacion = z.enum(ResultadoMediacion);

/** Texto obligatorio, recortado, con máximo de caracteres. */
export function zTexto(max: number, min = 1) {
  return z
    .string()
    .trim()
    .min(min, min <= 1 ? "Este campo es obligatorio." : `Escribe al menos ${min} caracteres.`)
    .max(max, `Máximo ${max} caracteres.`);
}

/** Texto opcional: '' o ausente → undefined. */
export function zTextoOpcional(max: number) {
  return z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max, `Máximo ${max} caracteres.`).optional(),
  );
}

/** Escala Likert 1–5 (acepta strings de FormData). */
export const zEscala = z.coerce.number().int().min(1, "Elige un valor del 1 al 5.").max(5, "Elige un valor del 1 al 5.");

/** Booleano desde FormData: 'on' | 'true' | '1' → true. */
export const zBool = z.preprocess((v) => v === true || v === "on" || v === "true" || v === "1", z.boolean());

/** Fecha 'YYYY-MM-DD'. */
export const zFechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha válida.");

export type Resultado<T> = { ok: true; data: T } | { ok: false; error: string };

/** Convierte FormData en objeto plano (los campos repetidos quedan como arreglo). */
export function formDataAObjeto(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("$ACTION")) continue;
    if (k in obj) obj[k] = ([] as unknown[]).concat(obj[k], v);
    else obj[k] = v;
  }
  return obj;
}

/**
 * Envuelve una Server Action: valida la entrada con zod y captura errores, devolviendo
 * `{ ok: true, data } | { ok: false, error }` con mensajes amables. Los redirect() se propagan.
 *
 *   export const crear = accion(esquema, async (datos) => { await requireRole('equipo'); ... });
 *
 * La acción resultante acepta un objeto o un FormData, y también sirve con useActionState
 * (firma `(estadoPrevio, entrada)`), detectando el caso por el número de argumentos.
 */
export function accion<S extends z.ZodType, T>(esquema: S, fn: (datos: z.infer<S>) => Promise<T>) {
  async function ejecutar(entrada: FormData | unknown): Promise<Resultado<T>> {
    const crudo = entrada instanceof FormData ? formDataAObjeto(entrada) : entrada;
    const parsed = esquema.safeParse(crudo);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
    }
    try {
      return { ok: true, data: await fn(parsed.data) };
    } catch (e) {
      unstable_rethrow(e);
      if (e instanceof ErrorAmable) return { ok: false, error: e.message };
      console.error(e);
      return { ok: false, error: "No pudimos guardar. Intenta de nuevo en un momento." };
    }
  }
  return async function (...args: unknown[]): Promise<Resultado<T>> {
    return ejecutar(args.length >= 2 ? args[1] : args[0]);
  };
}

/** Lanza este error dentro de `accion()` para mostrarle a la usuaria un mensaje concreto. */
export class ErrorAmable extends Error {}
