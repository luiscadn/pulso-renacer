import { timingSafeEqual, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_SESION,
  DURACION_SESION_SEGUNDOS,
  firmarSesion,
  verificarSesion,
  type Rol,
} from "./sesion-token";

export type { Rol } from "./sesion-token";
export { ROLES, COOKIE_AVISO_PRIVACIDAD } from "./sesion-token";

export type Sesion = { rol: Rol };

export async function crearSesion(rol: Rol): Promise<void> {
  const token = await firmarSesion(rol);
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SESION_SEGUNDOS,
  });
}

export async function leerSesion(): Promise<Sesion | null> {
  return verificarSesion((await cookies()).get(COOKIE_SESION)?.value);
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}

/**
 * Exige sesión con alguno de los roles. `gestion` incluye todo lo de `equipo`,
 * así que `requireRole('equipo')` también deja pasar a gestión.
 */
export async function requireRole(rol: Rol | Rol[]): Promise<Sesion> {
  const sesion = await leerSesion();
  if (!sesion) redirect("/ingresar");
  const permitidos = Array.isArray(rol) ? rol : [rol];
  const ok = sesion.rol === "gestion" || permitidos.includes(sesion.rol);
  if (!ok) redirect("/inicio");
  return sesion;
}

function iguales(a: string, b: string): boolean {
  // Hash previo: longitudes iguales y comparación en tiempo constante.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Devuelve el rol que corresponde al código, o null. Compara en tiempo constante. */
export function verificarCodigo(codigo: string): Rol | null {
  const c = codigo.trim();
  const team = process.env.TEAM_CODE ?? "";
  const admin = process.env.ADMIN_CODE ?? "";
  const esAdmin = admin.length > 0 && iguales(c, admin);
  const esTeam = team.length > 0 && iguales(c, team);
  if (esAdmin) return "gestion";
  if (esTeam) return "equipo";
  return null;
}

// --- Límite de intentos (en memoria; la IP nunca se persiste) ---
const MAX_INTENTOS = 5;
const VENTANA_MS = 10 * 60 * 1000;
const intentos = new Map<string, number[]>();

export function registrarIntento(clave: string, ahora = Date.now()): { permitido: boolean; esperaMin: number } {
  const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAX_INTENTOS) {
    intentos.set(clave, recientes);
    const esperaMin = Math.ceil((VENTANA_MS - (ahora - recientes[0])) / 60000);
    return { permitido: false, esperaMin };
  }
  recientes.push(ahora);
  intentos.set(clave, recientes);
  // Limpieza ocasional para no crecer sin límite.
  if (intentos.size > 1000) for (const [k, v] of intentos) if (v.every((t) => ahora - t >= VENTANA_MS)) intentos.delete(k);
  return { permitido: true, esperaMin: 0 };
}

export function reiniciarIntentos(clave: string): void {
  intentos.delete(clave);
}

export async function ipCliente(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}
