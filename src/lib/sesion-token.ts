/**
 * Firma y verificación del JWT de sesión. Sin dependencias de Next para poder usarse en
 * `src/proxy.ts`, en Server Components y en pruebas.
 */
import { jwtVerify, SignJWT } from "jose";

export type Rol = "equipo" | "gestion";
export const ROLES: readonly Rol[] = ["equipo", "gestion"];

export const COOKIE_SESION = "pr_session";
export const COOKIE_AVISO_PRIVACIDAD = "pr_aviso_ok";
export const DURACION_SESION_SEGUNDOS = 60 * 60 * 24 * 30; // 30 días

function secreto(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET falta o es muy corto (mínimo 32 caracteres).");
    return new TextEncoder().encode("dev-secret-local-no-usar-en-produccion-0123456789");
  }
  return new TextEncoder().encode(s);
}

export async function firmarSesion(rol: Rol): Promise<string> {
  return new SignJWT({ rol })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SESION_SEGUNDOS}s`)
    .sign(secreto());
}

export async function verificarSesion(token: string | undefined | null): Promise<{ rol: Rol } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secreto(), { algorithms: ["HS256"] });
    const rol = payload.rol;
    return rol === "equipo" || rol === "gestion" ? { rol } : null;
  } catch {
    return null;
  }
}
