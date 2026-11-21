"use client";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export function BotonImprimir({ etiqueta = "Imprimir / PDF" }: { etiqueta?: string }) {
  return (
    <Button variante="secundario" icono={<Printer aria-hidden className="size-5" />} onClick={() => window.print()}>
      {etiqueta}
    </Button>
  );
}
