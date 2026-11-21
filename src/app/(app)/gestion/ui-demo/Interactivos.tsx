"use client";
import { useState } from "react";
import { Clock, TrafficCone } from "lucide-react";
import { Button, ChoiceCards, CopyButton, Field, FormStatus, Input, Likert, Select, Textarea } from "@/components/ui";

export function Interactivos() {
  const [estado, setEstado] = useState<"inactivo" | "cargando" | "exito" | "error">("inactivo");
  return (
    <div className="flex flex-col gap-5">
      <Field label="Input" ayuda="Texto de ayuda" error="Mensaje de error de ejemplo">
        <Input placeholder="Escribe aquí" />
      </Field>
      <Field label="Select" opcional>
        <Select placeholder="Elige…" opciones={[{ valor: "a", etiqueta: "Cabina 1" }, { valor: "b", etiqueta: "Láser" }]} />
      </Field>
      <Field label="Textarea con contador">
        <Textarea maxLength={800} name="t" />
      </Field>
      <ChoiceCards
        name="demo"
        leyenda="ChoiceCards (2 columnas)"
        columnas={2}
        opciones={[
          { valor: "a", etiqueta: "Verde", descripcion: "A tiempo", icono: <TrafficCone className="size-6" /> },
          { valor: "b", etiqueta: "Amarillo", descripcion: "Hasta 15 min", icono: <Clock className="size-6" /> },
        ]}
      />
      <Likert name="p1" enunciado="Likert: afirmación de ejemplo." />
      <CopyButton texto="Texto copiado desde la guía visual" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { setEstado("cargando"); setTimeout(() => setEstado("exito"), 800); }}>Simular éxito</Button>
        <Button variante="peligro" onClick={() => setEstado("error")}>Simular error</Button>
      </div>
      <FormStatus estado={estado} mensaje={estado === "exito" ? "¡Listo! Guardamos tu registro." : estado === "error" ? "No pudimos guardar." : undefined} />
    </div>
  );
}
