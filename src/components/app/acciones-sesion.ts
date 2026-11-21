"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cerrarSesion, COOKIE_AVISO_PRIVACIDAD } from "@/lib/auth";

export async function salir() {
  await cerrarSesion();
  redirect("/ingresar");
}

export async function aceptarAvisoPrivacidad() {
  (await cookies()).set(COOKIE_AVISO_PRIVACIDAD, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
