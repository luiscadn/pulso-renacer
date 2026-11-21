"use client";
import { useActionState, useState } from "react";
import { Button, Chip, Field, FormStatus, Select, Textarea } from "@/components/ui";
import { ESTADO_SUGERENCIA } from "@/lib/labels";
import type { Resultado } from "@/lib/validacion";
import { guardarRespuesta } from "../actions";
import { MAX_RESUMEN } from "../esquemas";

type Props = {
  id: string;
  texto: string;
  firma: string | null;
  estado: string;
  resumenPublico: string | null;
  respuesta: string | null;
  publicada: boolean;
};

const OPCIONES_ESTADO = Object.entries(ESTADO_SUGERENCIA).map(([valor, etiqueta]) => ({ valor, etiqueta }));

export function EditorSugerencia(p: Props) {
  const [estado, guardar, pendiente] = useActionState<Resultado<{ guardado: boolean }> | null, FormData>(guardarRespuesta, null);
  const [publicada, setPublicada] = useState(p.publicada);
  const error = estado && !estado.ok ? estado.error : undefined;
  return (
    <form action={guardar} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={p.id} />
      <section aria-label="Propuesta original" className="rounded-xl2 bg-arena p-3">
        <p className="whitespace-pre-wrap text-base">{p.texto}</p>
        <p className="mt-2 text-sm text-texto-suave">
          {p.firma ? (
            <>
              Firmada por <strong>{p.firma}</strong>
            </>
          ) : (
            <Chip>Anónima</Chip>
          )}
        </p>
      </section>
      <Field label="Estado">
        <Select name="estado" defaultValue={p.estado} opciones={OPCIONES_ESTADO} />
      </Field>
      <Field label="Resumen público" ayuda="Parafrasea sin datos que identifiquen a nadie. Es lo que se lee en «Propusiste».">
        <Textarea name="resumenPublico" maxLength={MAX_RESUMEN} defaultValue={p.resumenPublico ?? ""} className="min-h-20" rows={3} />
      </Field>
      <Field label="Respuesta" ayuda="Lo que hicimos (o por qué no). Es lo que se lee en «Hicimos».">
        <Textarea name="respuesta" maxLength={800} defaultValue={p.respuesta ?? ""} rows={4} />
      </Field>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-medium">
        <input
          type="checkbox"
          name="publicada"
          checked={publicada}
          onChange={(e) => setPublicada(e.target.checked)}
          className="size-6 accent-primario-osc"
        />
        Publicar en el muro
      </label>
      <Button type="submit" tamano="lg" cargando={pendiente}>
        Guardar
      </Button>
      <FormStatus
        estado={pendiente ? "cargando" : error ? "error" : estado?.ok ? "exito" : "inactivo"}
        mensaje={pendiente ? "Guardando…" : error ?? (estado?.ok ? "Guardado." : undefined)}
      />
    </form>
  );
}
