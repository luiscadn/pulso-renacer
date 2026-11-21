import Link from "next/link";
import { redirect } from "next/navigation";
import { leerSesion } from "@/lib/auth";
import { FormIngreso } from "./FormIngreso";

export const metadata = { title: "Ingresar" };

export default async function IngresarPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await leerSesion()) redirect("/inicio");
  const { volver } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-texto-suave">Renacer Clínica y Spa</p>
        <h1 className="mt-1 text-4xl font-semibold text-primario-osc">Pulso Renacer</h1>
        <p className="mt-2 text-texto-suave">Nuestra comunicación interna, en un solo lugar.</p>
      </div>
      <div className="rounded-xl2 border border-borde bg-white p-5 shadow-suave">
        <FormIngreso volver={typeof volver === "string" ? volver : undefined} />
      </div>
      <p className="text-center text-sm text-texto-suave">
        No guardamos tu nombre, tu correo ni tu IP.{" "}
        <Link href="/privacidad" className="font-medium text-primario-osc underline">
          Aviso de privacidad
        </Link>
      </p>
    </main>
  );
}
