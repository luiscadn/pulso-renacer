import Link from "next/link";
import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import { AvisoPrivacidad } from "@/components/app/AvisoPrivacidad";
import { BarraInferior } from "@/components/app/BarraInferior";
import { salir } from "@/components/app/acciones-sesion";
import { COOKIE_AVISO_PRIVACIDAD, requireRole } from "@/lib/auth";
import { esModoDemo } from "@/lib/demo";
import { ROL_SESION } from "@/lib/labels";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requireRole("equipo");
  const avisoAceptado = (await cookies()).get(COOKIE_AVISO_PRIVACIDAD)?.value === "1";
  const demo = esModoDemo();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-xl2 focus:bg-white focus:p-3">
        Saltar al contenido
      </a>
      <div className="no-imprimir sticky top-0 z-20">
        {demo && (
          <p role="note" className="bg-acento px-4 py-1.5 text-center text-sm font-semibold text-texto">
            Datos de demostración
          </p>
        )}
        <header className="border-b border-borde bg-crema/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2">
            <Link href="/inicio" className="flex min-h-11 items-center font-serif text-xl font-semibold text-primario-osc">
              Pulso Renacer
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-arena px-2.5 py-0.5 text-sm font-medium">{ROL_SESION[sesion.rol]}</span>
              <form action={salir}>
                <button type="submit" className="flex min-h-11 items-center gap-1 rounded-xl2 px-2 text-sm font-medium text-texto-suave hover:bg-arena">
                  <LogOut aria-hidden className="size-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        </header>
      </div>
      <main id="contenido" className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5">
        {children}
      </main>
      <BarraInferior />
      {!avisoAceptado && <AvisoPrivacidad />}
    </div>
  );
}
