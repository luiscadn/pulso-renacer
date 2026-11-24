import Link from "next/link";
import { redirect } from "next/navigation";
import { leerSesion } from "@/lib/auth";
import { FormIngreso } from "./FormIngreso";

export const metadata = { title: "Ingresar" };

export default async function IngresarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await leerSesion()) redirect("/inicio");
  const { volver } = await searchParams;
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/ola-sup.png" alt="" aria-hidden="true" className="decor absolute left-0 top-0 -z-10 w-32 sm:w-64" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/rama.png" alt="" aria-hidden="true" className="decor absolute right-0 top-0 -z-10 h-40 w-auto opacity-80 sm:h-64" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/marca/ola-inf.png" alt="" aria-hidden="true" className="decor absolute inset-x-0 bottom-0 -z-10 h-16 w-full object-cover object-top sm:h-28" />
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-7 px-4 pb-24 pt-28">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/loto.png" alt="" aria-hidden="true" className="decor mx-auto mb-2 h-16 w-auto" />
          <h1 className="text-6xl leading-none text-vino">Renacer</h1>
          <p className="mt-2 font-serif text-3xl font-bold text-rosa-texto">Pulso Renacer</p>
          <p className="mt-2 text-sm text-texto-suave">Clínica y Spa · Nuestra comunicación interna</p>
        </div>
        <div className="rounded-xl2 border-2 border-borde bg-white p-5 shadow-suave">
          <FormIngreso volver={typeof volver === "string" ? volver : undefined} />
        </div>
        <p className="text-center text-sm text-texto-suave">
          No guardamos tu nombre, tu correo ni tu IP.{" "}
          <Link href="/privacidad" className="font-medium text-vino underline">
            Aviso de privacidad
          </Link>
        </p>
      </main>
    </div>
  );
}
