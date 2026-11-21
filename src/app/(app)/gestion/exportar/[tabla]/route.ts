import { NextResponse } from "next/server";
import { leerSesion } from "@/lib/auth";
import { claveDia } from "@/lib/fechas";
import { csvDeTabla, esTablaExportable } from "@/features/tablero/exportar";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ tabla: string }> }) {
  // Los route handlers no pasan por el layout: se valida el rol aquí, sin redirigir.
  const sesion = await leerSesion();
  if (!sesion || sesion.rol !== "gestion") return new NextResponse("No autorizado", { status: 403 });
  const { tabla } = await params;
  if (!esTablaExportable(tabla)) return new NextResponse("Tabla no encontrada", { status: 404 });
  const q = new URL(req.url).searchParams;
  const csv = await csvDeTabla(tabla, { p: q.get("p") ?? undefined, desde: q.get("desde") ?? undefined, hasta: q.get("hasta") ?? undefined });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="renacer-${tabla}-${claveDia(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
