import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "./cn";

export const clasesControl =
  "w-full min-h-12 rounded-xl2 border border-borde bg-white px-4 text-base text-texto placeholder:text-texto-suave/70 " +
  "focus:border-primario-osc focus:outline-none focus-visible:outline-[3px] aria-[invalid=true]:border-rojo";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(clasesControl, className)} {...rest} />;
}

export function Select({
  className,
  opciones,
  placeholder,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  opciones: Array<{ valor: string; etiqueta: string }>;
  placeholder?: string;
}) {
  return (
    <select className={cn(clasesControl, "appearance-auto", className)} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.etiqueta}
        </option>
      ))}
    </select>
  );
}
