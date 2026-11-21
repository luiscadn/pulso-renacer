"use server";
import { redirect } from "next/navigation";
import { crearSesion, ipCliente, registrarIntento, reiniciarIntentos, verificarCodigo } from "@/lib/auth";

export type EstadoIngreso = { error?: string };

function destinoSeguro(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/inicio";
}

export async function ingresar(_prev: EstadoIngreso, fd: FormData): Promise<EstadoIngreso> {
  const codigo = String(fd.get("codigo") ?? "").trim();
  if (!codigo) return { error: "Escribe el código que te dio la administración." };
  const ip = await ipCliente();
  const intento = registrarIntento(ip);
  if (!intento.permitido) {
    return { error: `Hiciste varios intentos seguidos. Espera ${intento.esperaMin} min y vuelve a probar.` };
  }
  const rol = verificarCodigo(codigo);
  if (!rol) return { error: "Ese código no es correcto. Revísalo con calma y vuelve a intentarlo." };
  reiniciarIntentos(ip);
  await crearSesion(rol);
  redirect(destinoSeguro(fd.get("volver")));
}
