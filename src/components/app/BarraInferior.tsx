"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Compass, Home, Menu, TrafficCone } from "lucide-react";
import { cn } from "@/components/ui";

const ITEMS = [
  { href: "/inicio", etiqueta: "Inicio", Icono: Home },
  { href: "/acudo", etiqueta: "Acudo", Icono: Compass },
  { href: "/semaforo", etiqueta: "Semáforo", Icono: TrafficCone },
  { href: "/bitacora", etiqueta: "Bitácora", Icono: ClipboardList },
  { href: "/ayuda", etiqueta: "Más", Icono: Menu },
];

export function BarraInferior() {
  const ruta = usePathname();
  return (
    <nav aria-label="Navegación principal" className="no-imprimir fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {ITEMS.map(({ href, etiqueta, Icono }) => {
          const activo = ruta === href || ruta.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  activo ? "text-primario-osc" : "text-texto-suave",
                )}
              >
                <Icono aria-hidden className={cn("size-6", activo && "stroke-[2.5]")} />
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
