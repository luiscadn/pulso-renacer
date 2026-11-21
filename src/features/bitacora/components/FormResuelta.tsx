"use client";
import { useState, useTransition } from "react";
import { Button, Card, ChoiceCards, Field, FormStatus, Input } from "@/components/ui";
import { claveDia, sumarDias } from "@/lib/fechas";
import { registrarResuelta } from "../actions";
import { DIAS_RESUELTA_MAX } from "../logica";
import { CamposCierre } from "./CamposCierre";
import { opcionesDestinatario, opcionesRol, opcionesTiempo, opcionesTipo } from "./opciones";

export function FormResuelta() {
  const [error, setError] = useState<string>();
  const [exito, setExito] = useState<string>();
  const [version, setVersion] = useState(0);
  const [pendiente, empezar] = useTransition();
  const [{ hoy, minimo }] = useState(() => ({ hoy: claveDia(Date.now()), minimo: claveDia(sumarDias(new Date(), -DIAS_RESUELTA_MAX)) }));

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setError(undefined);
    setExito(undefined);
    empezar(async () => {
      const r = await registrarResuelta(datos);
      if (r.ok) {
        setExito("Listo, quedó registrada. Aparece en «Recientes».");
        setVersion((v) => v + 1); // reinicia el formulario
      } else setError(r.error);
    });
  }

  return (
    <Card>
      <form key={version} onSubmit={enviar} className="flex flex-col gap-5">
        <p className="text-base text-texto-suave">Para una consulta que ya se resolvió y no alcanzaste a registrar.</p>
        <ChoiceCards name="quienConsulta" leyenda="¿Quién consultó?" opciones={opcionesRol} columnas={1} requerido />
        <ChoiceCards name="tipo" leyenda="¿Sobre qué fue?" opciones={opcionesTipo} columnas={1} requerido />
        <ChoiceCards name="dirigidaA" leyenda="¿A quién se dirigió primero?" opciones={opcionesDestinatario} columnas={1} requerido />
        <Field label="¿Qué día fue?" ayuda={`Hasta hace ${DIAS_RESUELTA_MAX} días.`}>
          <Input type="date" name="fecha" required min={minimo} max={hoy} defaultValue={hoy} />
        </Field>
        <CamposCierre />
        <ChoiceCards name="tiempoRespuesta" leyenda="¿Cuánto tardó la respuesta?" opciones={opcionesTiempo} columnas={1} requerido />
        <FormStatus estado={pendiente ? "cargando" : error ? "error" : exito ? "exito" : "inactivo"} mensaje={pendiente ? "Guardando…" : (error ?? exito)} />
        <Button type="submit" tamano="lg" cargando={pendiente}>Registrar consulta resuelta</Button>
      </form>
    </Card>
  );
}
