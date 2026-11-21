import { db } from "@/lib/db";
import { filtroDemo } from "@/lib/demo";
import { leerAjuste } from "@/lib/ajustes";
import { contarCirculos } from "./conteo";

export async function listarActas() {
  return db.actaCirculo.findMany({ where: filtroDemo(), orderBy: [{ fecha: "desc" }, { id: "desc" }] });
}

export async function obtenerActa(id: string) {
  return db.actaCirculo.findFirst({ where: { id, ...filtroDemo() } });
}

export async function listarMediaciones() {
  return db.mediacion.findMany({ where: filtroDemo(), orderBy: [{ fecha: "desc" }, { id: "desc" }] });
}

/** «Círculos realizados: n / meta», contando desde el inicio de la línea base. */
export async function progresoCirculos(): Promise<{ n: number; meta: number }> {
  const [actas, inicio, meta] = await Promise.all([
    db.actaCirculo.findMany({ where: filtroDemo(), select: { fecha: true } }),
    leerAjuste("lineaBaseInicio"),
    leerAjuste("metaCirculos"),
  ]);
  const metaNum = Number.parseInt(meta ?? "", 10);
  return { n: contarCirculos(actas.map((a) => a.fecha), inicio), meta: Number.isFinite(metaNum) && metaNum > 0 ? metaNum : 6 };
}
