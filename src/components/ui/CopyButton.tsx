"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { clasesBoton, type TamanoBoton, type VarianteBoton } from "./Button";

/** Copia un texto al portapapeles. `onCopiado` permite registrar el evento (por ejemplo, un AvisoAgenda). */
export function CopyButton({
  texto,
  etiqueta = "Copiar",
  onCopiado,
  variante = "secundario",
  tamano = "md",
}: {
  texto: string;
  etiqueta?: string;
  onCopiado?: () => void;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
}) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const t = document.createElement("textarea");
      t.value = texto;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopiado(true);
    onCopiado?.();
    setTimeout(() => setCopiado(false), 2000);
  }
  return (
    <button type="button" onClick={copiar} className={clasesBoton(variante, tamano)}>
      {copiado ? <Check aria-hidden className="size-5" /> : <Copy aria-hidden className="size-5" />}
      <span aria-live="polite">{copiado ? "¡Copiado!" : etiqueta}</span>
    </button>
  );
}
