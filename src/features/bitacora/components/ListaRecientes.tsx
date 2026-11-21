"use client";
import { useState, useTransition } from "react";
import { Button, Card, Chip, ChoiceCards, EmptyState, FormStatus } from "@/components/ui";
import { formatoCorto } from "@/lib/fechas";
import { DESTINATARIO, ROL_CONSULTANTE, TIEMPO_RESPUESTA, TIPO_SITUACION } from "@/lib/labels";
import { marcarRevertida } from "../actions";
import type { ConsultaVista } from "../queries";
import { Hoja } from "./Hoja";
import { opcionesDestinatario } from "./opciones";

export function ListaRecientes({ consultas }: { consultas: ConsultaVista[] }) {
  const [revirtiendo, setRevirtiendo] = useState<ConsultaVista | null>(null);
  const [quien, setQuien] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [exito, setExito] = useState<string>();
  const [pendiente, empezar] = useTransition();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!revirtiendo || !quien) return setError("Elige quién la revirtió.");
    setError(undefined);
    empezar(async () => {
      const r = await marcarRevertida({ id: revirtiendo.id, revertidaPor: quien });
      if (r.ok) {
        setRevirtiendo(null);
        setExito("Quedó marcada como revertida.");
      } else setError(r.error);
    });
  }

  if (consultas.length === 0) {
    return <EmptyState titulo="Aún no hay consultas cerradas" descripcion="Aquí verás las de los últimos 30 días." />;
  }
  return (
    <div className="flex flex-col gap-3">
      <FormStatus estado={exito ? "exito" : "inactivo"} mensaje={exito} />
      <ul className="flex flex-col gap-3">
        {consultas.map((c) => (
          <li key={c.id}>
            <Card className="flex flex-col gap-3">
              <div>
                <p className="text-lg font-semibold">{TIPO_SITUACION[c.tipo as keyof typeof TIPO_SITUACION]}</p>
                <p className="text-base text-texto-suave">
                  {ROL_CONSULTANTE[c.quienConsulta as keyof typeof ROL_CONSULTANTE]} → {DESTINATARIO[c.dirigidaA as keyof typeof DESTINATARIO]} ·
                  cerrada el {formatoCorto(new Date(c.cerradaEn!))}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.tiempoRespuesta && (
                  <Chip tono={c.tiempoRespuesta === "SIN_RESPUESTA" || c.tiempoRespuesta === "MAS_24H" ? "amarillo" : "verde"}>
                    {TIEMPO_RESPUESTA[c.tiempoRespuesta as keyof typeof TIEMPO_RESPUESTA]}
                  </Chip>
                )}
                {c.decidio === "ROL_DELEGADO" && <Chip>Decidió un rol delegado</Chip>}
                {c.decidio === "PROPIETARIA" && <Chip>Decidió la propietaria</Chip>}
                {c.revertida && (
                  <Chip tono="rojo">Revertida{c.revertidaPor ? ` por ${DESTINATARIO[c.revertidaPor as keyof typeof DESTINATARIO]}` : ""}</Chip>
                )}
              </div>
              {c.decidio === "ROL_DELEGADO" && !c.revertida && (
                <Button
                  variante="secundario"
                  onClick={() => {
                    setQuien(null);
                    setError(undefined);
                    setExito(undefined);
                    setRevirtiendo(c);
                  }}
                >
                  Marcar como revertida
                </Button>
              )}
            </Card>
          </li>
        ))}
      </ul>
      <Hoja abierta={revirtiendo !== null} onCerrar={() => setRevirtiendo(null)} titulo="Marcar como revertida">
        <form onSubmit={enviar} className="flex flex-col gap-4">
          <p className="text-base text-texto-suave">Una decisión se revierte cuando alguien más la cambia después de que el rol delegado la tomó.</p>
          <ChoiceCards name="revertidaPor" leyenda="¿Quién la revirtió?" opciones={opcionesDestinatario} valor={quien} onChange={setQuien} requerido />
          <FormStatus estado={pendiente ? "cargando" : error ? "error" : "inactivo"} mensaje={pendiente ? "Guardando…" : error} />
          <Button type="submit" tamano="lg" cargando={pendiente}>Marcar como revertida</Button>
        </form>
      </Hoja>
    </div>
  );
}
