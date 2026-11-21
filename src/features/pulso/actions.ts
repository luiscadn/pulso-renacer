"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { soloFecha } from "@/lib/fechas";
import { accion, ErrorAmable } from "@/lib/validacion";
import { esquemaPulso, esquemaPulsoRoles } from "./esquemas";
import { cookiePulso, cookiePulsoRoles, semanaActual } from "./semana";

const OPCIONES_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 8,
};

/** Guarda una respuesta anónima: solo semana, día y valores. Nada que identifique a quien responde. */
export const responderPulso = accion(esquemaPulso, async (datos) => {
  await requireRole("equipo");
  const semana = semanaActual();
  const jar = await cookies();
  if (jar.get(cookiePulso(semana))) throw new ErrorAmable("Ya respondiste el pulso de esta semana. ¡Gracias!");
  await db.respuestaPulso.create({ data: { semana, fecha: soloFecha(), ...datos } });
  jar.set(cookiePulso(semana), "1", OPCIONES_COOKIE);
  revalidatePath("/pulso");
  return { semana };
});

export const responderPulsoRoles = accion(esquemaPulsoRoles, async (datos) => {
  await requireRole("gestion");
  const semana = semanaActual();
  const jar = await cookies();
  if (jar.get(cookiePulsoRoles(semana))) throw new ErrorAmable("Ya respondiste esta pregunta esta semana. ¡Gracias!");
  await db.respuestaPulsoRoles.create({ data: { semana, fecha: soloFecha(), p7: datos.p7 } });
  jar.set(cookiePulsoRoles(semana), "1", OPCIONES_COOKIE);
  revalidatePath("/gestion/pulso-roles");
  return { semana };
});
