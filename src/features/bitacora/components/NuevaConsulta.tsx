"use client";
import { CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button, Card, ChoiceCards, FormStatus } from "@/components/ui";
import { DESTINATARIO, ROL_CONSULTANTE, TIPO_SITUACION } from "@/lib/labels";
import { abrirConsulta } from "../actions";
import { opcionesDestinatario, opcionesRol, opcionesTipo } from "./opciones";

type Estado = { quienConsulta?: string; tipo?: string };

const PASOS = [
  { campo: "quienConsulta", leyenda: "¿Quién consulta?", opciones: opcionesRol },
  { campo: "tipo", leyenda: "¿Sobre qué es la consulta?", opciones: opcionesTipo },
  { campo: "dirigidaA", leyenda: "¿A quién se dirigió primero?", opciones: opcionesDestinatario },
] as const;

/** Tres toques: quién consulta → tipo → a quién. El tercero guarda de una vez. */
export function NuevaConsulta({ alVerAbiertas }: { alVerAbiertas: () => void }) {
  const [paso, setPaso] = useState(0);
  const [elegido, setElegido] = useState<Estado>({});
  const [error, setError] = useState<string>();
  const [listo, setListo] = useState<{ quien: string; tipo: string; a: string } | null>(null);
  const [pendiente, empezar] = useTransition();

  function reiniciar() {
    setPaso(0);
    setElegido({});
    setError(undefined);
    setListo(null);
  }

  function elegir(campo: (typeof PASOS)[number]["campo"], valor: string) {
    setError(undefined);
    if (campo !== "dirigidaA") {
      setElegido((e) => ({ ...e, [campo]: valor }));
      setPaso((p) => p + 1);
      return;
    }
    empezar(async () => {
      const r = await abrirConsulta({ ...elegido, dirigidaA: valor });
      if (r.ok) {
        setListo({
          quien: ROL_CONSULTANTE[elegido.quienConsulta as keyof typeof ROL_CONSULTANTE],
          tipo: TIPO_SITUACION[elegido.tipo as keyof typeof TIPO_SITUACION],
          a: DESTINATARIO[valor as keyof typeof DESTINATARIO],
        });
      } else setError(r.error);
    });
  }

  if (listo) {
    return (
      <Card className="flex flex-col gap-4 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-verde" />
        <div role="status" aria-live="polite">
          <p className="font-serif text-xl font-semibold">Consulta abierta</p>
          <p className="mt-1 text-base text-texto-suave">
            {listo.quien} · {listo.tipo} · dirigida a {listo.a}. Cuando tengas respuesta, ciérrala desde «Abiertas».
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button tamano="lg" onClick={reiniciar}>Registrar otra</Button>
          <Button tamano="lg" variante="secundario" onClick={alVerAbiertas}>Ver abiertas</Button>
        </div>
      </Card>
    );
  }

  const actual = PASOS[paso];
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm font-medium text-texto-suave" aria-live="polite">Paso {paso + 1} de 3</p>
      <ChoiceCards
        key={actual.campo}
        name={actual.campo}
        leyenda={actual.leyenda}
        opciones={[...actual.opciones]}
        valor={null}
        columnas={1}
        onChange={(v) => elegir(actual.campo, v)}
      />
      <FormStatus estado={pendiente ? "cargando" : error ? "error" : "inactivo"} mensaje={pendiente ? "Abriendo la consulta…" : error} />
      {paso > 0 && (
        <Button variante="fantasma" disabled={pendiente} onClick={() => { setPaso(paso - 1); setError(undefined); }}>
          ← Atrás
        </Button>
      )}
    </Card>
  );
}
