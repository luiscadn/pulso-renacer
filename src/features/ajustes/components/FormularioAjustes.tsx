"use client";
import { useActionState } from "react";
import { Button, Field, FormStatus, Input } from "@/components/ui";
import { guardarAjustes } from "../actions";

type Valores = Record<"lineaBaseInicio" | "lineaBaseFin" | "umbralAnonimato" | "metaCirculos" | "cabinas" | "kitCabinasActualizadas" | "kitCabinasTotal", string>;
type Estado = { ok: boolean; mensaje: string } | null;

export function FormularioAjustes({ valores }: { valores: Valores }) {
  const [estado, enviar, pendiente] = useActionState<Estado, FormData>(async (_prev, fd) => {
    const r = await guardarAjustes(fd);
    return r.ok ? { ok: true, mensaje: r.data.mensaje } : { ok: false, mensaje: r.error };
  }, null);
  return (
    <form action={enviar} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">Línea base</legend>
        <p className="text-sm text-texto-suave">Son las dos semanas de referencia contra las que se comparan los indicadores.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde"><Input type="date" name="lineaBaseInicio" defaultValue={valores.lineaBaseInicio} required /></Field>
          <Field label="Hasta"><Input type="date" name="lineaBaseFin" defaultValue={valores.lineaBaseFin} required /></Field>
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">Anonimato y círculos</legend>
        <Field label="Mínimo de registros para mostrar un dato" ayuda="Mínimo 3. Con menos registros, el tablero no muestra el dato.">
          <Input type="number" inputMode="numeric" name="umbralAnonimato" min={3} step={1} defaultValue={valores.umbralAnonimato} required />
        </Field>
        <Field label="Meta de círculos de bienestar" ayuda="Cuántos círculos se esperan en total.">
          <Input type="number" inputMode="numeric" name="metaCirculos" min={1} step={1} defaultValue={valores.metaCirculos} required />
        </Field>
      </fieldset>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold">Cabinas y kit</legend>
        <Field label="Cabinas" ayuda="Sepáralas con comas. Aparecen en el semáforo.">
          <Input name="cabinas" defaultValue={valores.cabinas} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cabinas con kit actualizado"><Input type="number" inputMode="numeric" name="kitCabinasActualizadas" min={0} step={1} defaultValue={valores.kitCabinasActualizadas} required /></Field>
          <Field label="Total de cabinas"><Input type="number" inputMode="numeric" name="kitCabinasTotal" min={1} step={1} defaultValue={valores.kitCabinasTotal} required /></Field>
        </div>
      </fieldset>
      <Button type="submit" tamano="lg" cargando={pendiente}>Guardar ajustes</Button>
      <FormStatus estado={pendiente ? "cargando" : estado ? (estado.ok ? "exito" : "error") : "inactivo"} mensaje={estado?.mensaje} />
    </form>
  );
}
