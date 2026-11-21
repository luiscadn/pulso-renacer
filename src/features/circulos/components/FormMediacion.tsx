"use client";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button, Field, FormStatus, Input, Select } from "@/components/ui";
import { claveDia } from "@/lib/fechas";
import { RESULTADO_MEDIACION } from "@/lib/labels";
import { crearMediacion } from "../actions";

const OPCIONES = Object.entries(RESULTADO_MEDIACION).map(([valor, etiqueta]) => ({ valor, etiqueta }));

export function FormMediacion() {
  const [pendiente, empezar] = useTransition();
  const [estado, setEstado] = useState<{ tipo: "inactivo" | "exito" | "error"; mensaje?: string }>({ tipo: "inactivo" });
  const [hoy] = useState(() => claveDia(Date.now()));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        empezar(async () => {
          const r = await crearMediacion(fd);
          setEstado(r.ok ? { tipo: "exito", mensaje: "Mediación registrada." } : { tipo: "error", mensaje: r.error });
        });
      }}
    >
      <p className="text-sm text-texto-suave">Solo se guarda la fecha y el resultado. No escribas nombres ni descripciones.</p>
      <Field label="Fecha de la mediación">
        <Input type="date" name="fecha" required max={hoy} defaultValue={hoy} />
      </Field>
      <Field label="Resultado">
        <Select name="resultado" defaultValue="EN_CURSO" opciones={OPCIONES} />
      </Field>
      <FormStatus estado={pendiente ? "cargando" : estado.tipo} mensaje={pendiente ? "Guardando…" : estado.mensaje} />
      <Button type="submit" tamano="lg" cargando={pendiente} icono={<Plus aria-hidden className="size-5" />}>
        Registrar mediación
      </Button>
    </form>
  );
}
