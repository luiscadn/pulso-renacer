"use client";
import { useId, useState, type ReactNode } from "react";
import { cn } from "./cn";

export type Opcion<V extends string = string> = { valor: V; etiqueta: string; descripcion?: string; icono?: ReactNode };

type Props<V extends string> = {
  /** Nombre del campo en el formulario (se envía con FormData). */
  name: string;
  leyenda: string;
  opciones: Opcion<V>[];
  valor?: V | null;
  valorInicial?: V;
  onChange?: (valor: V) => void;
  columnas?: 1 | 2 | 3;
  requerido?: boolean;
  error?: string;
  /** Oculta visualmente la leyenda (sigue disponible para lectores de pantalla). */
  ocultarLeyenda?: boolean;
};

/** Selector tipo radio con tarjetas grandes. Base de los formularios de 3 toques. */
export function ChoiceCards<V extends string>({
  name,
  leyenda,
  opciones,
  valor,
  valorInicial,
  onChange,
  columnas = 1,
  requerido,
  error,
  ocultarLeyenda,
}: Props<V>) {
  const id = useId();
  const [interno, setInterno] = useState<V | undefined>(valorInicial);
  const actual = valor !== undefined ? valor : interno;
  const cols = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" }[columnas];
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={cn("mb-2 text-base font-medium text-texto", ocultarLeyenda && "sr-only")}>{leyenda}</legend>
      <div className={cn("grid gap-2", cols)}>
        {opciones.map((o) => {
          const marcado = actual === o.valor;
          return (
            <label
              key={o.valor}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl2 border-2 bg-white p-3 transition-colors",
                "has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primario-osc",
                marcado ? "border-primario-osc bg-arena" : "border-borde hover:border-primario",
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.valor}
                checked={marcado}
                required={requerido}
                onChange={() => {
                  setInterno(o.valor);
                  onChange?.(o.valor);
                }}
                className="sr-only"
              />
              {o.icono && (
                <span aria-hidden className="text-primario-osc">
                  {o.icono}
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-base font-semibold">{o.etiqueta}</span>
                {o.descripcion && <span className="text-sm text-texto-suave">{o.descripcion}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-rojo-texto">
          {error}
        </p>
      )}
    </fieldset>
  );
}
