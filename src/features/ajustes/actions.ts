"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { esModoDemo } from "@/lib/demo";
import { borrarDemo, seedDemo } from "@/lib/demo-seed";
import { accion, ErrorAmable } from "@/lib/validacion";
import { esquemaAjustes } from "./esquema";

function refrescar() {
  for (const ruta of ["/gestion/tablero", "/gestion/tablero/imprimir", "/gestion/ajustes", "/inicio"]) revalidatePath(ruta);
}

export const guardarAjustes = accion(esquemaAjustes, async (d) => {
  await requireRole("gestion");
  const valores: Record<string, string> = {
    lineaBaseInicio: d.lineaBaseInicio,
    lineaBaseFin: d.lineaBaseFin,
    umbralAnonimato: String(d.umbralAnonimato),
    metaCirculos: String(d.metaCirculos),
    cabinas: d.cabinas.join(","),
    kitCabinasActualizadas: String(d.kitCabinasActualizadas),
    kitCabinasTotal: String(d.kitCabinasTotal),
  };
  await db.$transaction(
    Object.entries(valores).map(([clave, valor]) => db.ajuste.upsert({ where: { clave }, update: { valor }, create: { clave, valor } })),
  );
  refrescar();
  revalidatePath("/semaforo");
  return { mensaje: "Listo, guardamos los ajustes." };
});

const confirmacion = z.object({ confirmar: z.literal("si", { error: "Confirma para continuar." }) });

export const cargarDatosDemo = accion(confirmacion, async () => {
  await requireRole("gestion");
  if (!esModoDemo()) throw new ErrorAmable("Esta opción solo está disponible en modo demostración.");
  await seedDemo();
  refrescar();
  return { mensaje: "Cargamos los datos de demostración." };
});

export const borrarDatosDemo = accion(confirmacion, async () => {
  await requireRole("gestion");
  if (!esModoDemo()) throw new ErrorAmable("Esta opción solo está disponible en modo demostración.");
  await borrarDemo();
  refrescar();
  return { mensaje: "Borramos los datos de demostración." };
});
