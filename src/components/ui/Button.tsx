import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type VarianteBoton = "primario" | "secundario" | "fantasma" | "peligro";
export type TamanoBoton = "md" | "lg";

const variantes: Record<VarianteBoton, string> = {
  primario: "bg-vino text-white hover:bg-vino-osc shadow-suave",
  secundario: "rounded-full bg-white text-vino border-2 border-rosa hover:bg-blush",
  fantasma: "bg-transparent text-primario-osc hover:bg-arena",
  peligro: "bg-rojo-texto text-white hover:bg-[#7e232a]",
};
const tamanos: Record<TamanoBoton, string> = {
  md: "min-h-11 px-4 text-base",
  lg: "min-h-12 px-5 text-lg w-full",
};

export function clasesBoton(variante: VarianteBoton = "primario", tamano: TamanoBoton = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl2 font-semibold transition-colors",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    variantes[variante],
    tamanos[tamano],
    extra,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  cargando?: boolean;
  icono?: ReactNode;
};

export function Button({ variante, tamano, cargando, icono, className, children, disabled, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      className={clasesBoton(variante, tamano, className)}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...rest}
    >
      {cargando ? (
        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icono
      )}
      {children}
    </button>
  );
}

/** Enlace con apariencia de botón. */
export function ButtonLink({
  href,
  variante,
  tamano,
  className,
  children,
  icono,
}: {
  href: string;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  className?: string;
  children: ReactNode;
  icono?: ReactNode;
}) {
  return (
    <Link href={href} className={clasesBoton(variante, tamano, className)}>
      {icono}
      {children}
    </Link>
  );
}
