"use client";
import { useActionState } from "react";
import { Button, Field, FormStatus, Input } from "@/components/ui";
import { ingresar, type EstadoIngreso } from "./actions";

export function FormIngreso({ volver }: { volver?: string }) {
  const [estado, accion, pendiente] = useActionState<EstadoIngreso, FormData>(ingresar, {});
  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="volver" value={volver ?? ""} />
      <Field label="Código de ingreso" ayuda="Te lo da la administración. Es el mismo para todo el equipo.">
        <Input name="codigo" type="password" autoComplete="current-password" autoCapitalize="none" required autoFocus />
      </Field>
      <Button type="submit" tamano="lg" cargando={pendiente}>
        Entrar
      </Button>
      <FormStatus estado={estado.error ? "error" : "inactivo"} mensaje={estado.error} />
    </form>
  );
}
