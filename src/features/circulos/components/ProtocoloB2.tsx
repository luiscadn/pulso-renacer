"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Banner, Button, Card, CardTitle } from "@/components/ui";
import { PASOS_B2 } from "../textos";

/** Guía de mediación en 5 pasos. La checklist es local: no se guarda en ningún lado. */
export function ProtocoloB2() {
  const [marcados, setMarcados] = useState<boolean[]>(() => PASOS_B2.map(() => false));
  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Protocolo de mediación (B2)</CardTitle>
      <p className="text-sm text-texto-suave">Úsalo como guía mientras medias. Lo que marques aquí no se guarda.</p>
      <ol className="flex flex-col gap-2">
        {PASOS_B2.map((paso, i) => (
          <li key={paso}>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl2 p-2 text-base hover:bg-arena">
              <input
                type="checkbox"
                className="mt-0.5 size-6 shrink-0 accent-[var(--primario-osc)]"
                checked={marcados[i]}
                onChange={(e) => setMarcados((m) => m.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              <span className={marcados[i] ? "text-texto-suave line-through" : ""}>
                <strong>{i + 1}.</strong> {paso}
              </span>
            </label>
          </li>
        ))}
      </ol>
      <Banner tipo="aviso">Si el conflicto involucra a la administradora, media la propietaria.</Banner>
      <Button variante="fantasma" icono={<RotateCcw aria-hidden className="size-4" />} onClick={() => setMarcados(PASOS_B2.map(() => false))}>
        Empezar de nuevo
      </Button>
    </Card>
  );
}
