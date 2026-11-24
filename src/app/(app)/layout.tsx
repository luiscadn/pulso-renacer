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
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-xl2 focus:bg-white focus:p-3">
        Saltar al contenido
      </a>
      {/* Decoración de marca (detrás del contenido, sin captar toques) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/ola-sup.png" alt="" aria-hidden="true" className="decor no-imprimir absolute left-0 top-0 -z-10 w-28 opacity-70 sm:w-56 sm:opacity-100" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/rama.png" alt="" aria-hidden="true" className="decor no-imprimir absolute right-0 top-0 -z-10 hidden h-44 w-auto opacity-80 sm:block" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/destello.png" alt="" aria-hidden="true" className="decor no-imprimir absolute right-0 top-0 -z-10 size-20 opacity-50 sm:hidden" />
      <div className="no-imprimir relative z-20">
        {demo && (
          <p role="note" className="bg-rosa-suave px-4 py-1.5 text-center text-sm font-semibold text-texto">
            Datos de demostración
          </p>
        )}
        <header>
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-medium shadow-suave">{ROL_SESION[sesion.rol]}</span>
            <Link href="/inicio" className="flex min-h-11 items-center gap-2 font-serif text-2xl font-bold text-vino">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marca/loto.png" alt="" aria-hidden="true" className="decor h-6 w-auto" />
              Pulso Renacer
            </Link>
            <form action={salir}>
              <button type="submit" className="flex min-h-11 items-center gap-1 rounded-full bg-white px-3 text-sm font-medium text-vino shadow-suave hover:bg-blush">
                <LogOut aria-hidden className="size-4" />
                Salir
              </button>
            </form>
          </div>
        </header>
      </div>
      <main id="contenido" className="relative mx-auto w-full max-w-2xl flex-1 px-4 pb-4 pt-3">
        {children}
      </main>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/ola-inf.png" alt="" aria-hidden="true" className="decor no-imprimir -z-10 mb-[calc(3.5rem+env(safe-area-inset-bottom))] mt-6 h-12 w-full object-cover object-top opacity-70 sm:h-20 sm:opacity-100" />
      <BarraInferior />
      {!avisoAceptado && <AvisoPrivacidad />}
    </div>
  );
}
