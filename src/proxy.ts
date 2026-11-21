import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, verificarSesion } from "@/lib/sesion-token";

const PUBLICAS = ["/ingresar", "/privacidad", "/api/health", "/manifest.webmanifest"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLICAS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();

  const sesion = await verificarSesion(request.cookies.get(COOKIE_SESION)?.value);
  if (!sesion) {
    const url = new URL("/ingresar", request.url);
    if (pathname !== "/" && pathname !== "/inicio") url.searchParams.set("volver", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname === "/") return NextResponse.redirect(new URL("/inicio", request.url));
  if ((pathname === "/gestion" || pathname.startsWith("/gestion/")) && sesion.rol !== "gestion") {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Todo salvo estáticos de Next, íconos y archivos con extensión.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)"],
};
