"use client";
import { useId, useState } from "react";
import { ESCALA_LIKERT } from "@/lib/labels";
import { cn } from "./cn";

type Props = {
  name: string;
  enunciado: string;
  valor?: number | null;
  onChange?: (v: number) => void;
  requerido?: boolean;
  etiquetaMin?: string;
  etiquetaMax?: string;
};

/** Escala 1–5 con botones grandes y etiquetas en los extremos. */
export function Likert({
  name,
  enunciado,
  valor,
  onChange,
  requerido,
  etiquetaMin = ESCALA_LIKERT.min,
  etiquetaMax = ESCALA_LIKERT.max,
}: Props) {
  const id = useId();
  const [interno, setInterno] = useState<number | null>(null);
  const actual = valor !== undefined ? valor : interno;
  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={`${id}-ext`}>
      <legend className="mb-1 text-base font-medium leading-snug">{enunciado}</legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className={cn(
              "flex min-h-12 cursor-pointer items-center justify-center rounded-xl2 border-2 text-lg font-semibold",
              "has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primario-osc",
              actual === n ? "border-primario-osc bg-primario-osc text-white" : "border-borde bg-white hover:border-primario",
            )}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={actual === n}
              required={requerido}
              onChange={() => {
                setInterno(n);
                onChange?.(n);
              }}
              className="sr-only"
              aria-label={n === 1 ? `1, ${etiquetaMin}` : n === 5 ? `5, ${etiquetaMax}` : String(n)}
            />
            {n}
          </label>
        ))}
      </div>
      <p id={`${id}-ext`} className="flex justify-between text-sm text-texto-suave">
        <span>1 = {etiquetaMin}</span>
        <span>5 = {etiquetaMax}</span>
      </p>
    </fieldset>
  );
}
