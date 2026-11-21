"use client";
import { Clock } from "lucide-react";
import { useState, useTransition } from "react";
import { Button, Card, Chip, EmptyState, FormStatus } from "@/components/ui";
import { formatoRelativo } from "@/lib/fechas";
import { DESTINATARIO, ROL_CONSULTANTE, TIPO_SITUACION } from "@/lib/labels";
import { cerrarConsulta } from "../actions";
import { llevaMasDe24h } from "../logica";
import type { ConsultaVista } from "../queries";
import { CamposCierre } from "./CamposCierre";
import { Hoja } from "./Hoja";

export function ListaAbiertas({ consultas, alNueva }: { consultas: ConsultaVista[]; alNueva: () => void }) {
  const [cerrando, setCerrando] = useState<ConsultaVista | null>(null);
  const [error, setError] = useState<string>();
  const [exito, setExito] = useState<string>();
  const [pendiente, empezar] = useTransition();

  function cerrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cerrando) return;
    const datos = new FormData(e.currentTarget);
    datos.set("id", cerrando.id);
    setError(undefined);
    empezar(async () => {
      const r = await cerrarConsulta(datos);
      if (r.ok) {
        setCerrando(null);
        setExito("Consulta cerrada. ¡Gracias por registrarla!");
      } else setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <FormStatus estado={exito ? "exito" : "inactivo"} mensaje={exito} />
      {consultas.length === 0 ? (
        <EmptyState
          titulo="No hay consultas abiertas"
          descripcion="Cuando alguien consulte algo, regístralo en 3 toques."
          accion={<Button onClick={alNueva}>Registrar una consulta</Button>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {consultas.map((c) => {
            const vieja = llevaMasDe24h(new Date(c.abiertaEn));
            return (
              <li key={c.id}>
                <Card className="flex flex-col gap-3">
                  <div>
                    <p className="text-lg font-semibold">{TIPO_SITUACION[c.tipo as keyof typeof TIPO_SITUACION]}</p>
                    <p className="text-base text-texto-suave">
                      Consultó {ROL_CONSULTANTE[c.quienConsulta as keyof typeof ROL_CONSULTANTE]} · se dirigió a{" "}
                      {DESTINATARIO[c.dirigidaA as keyof typeof DESTINATARIO]}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip>
                      <Clock aria-hidden className="size-3.5" /> {formatoRelativo(new Date(c.abiertaEn))}
                    </Chip>
                    {vieja && <Chip tono="rojo">Más de 24 h sin cerrar</Chip>}
                  </div>
                  <Button
                    variante="secundario"
                    onClick={() => {
                      setError(undefined);
                      setExito(undefined);
                      setCerrando(c);
                    }}
                  >
                    Cerrar
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <Hoja abierta={cerrando !== null} onCerrar={() => setCerrando(null)} titulo="Cerrar la consulta">
        <form onSubmit={cerrar} className="flex flex-col gap-4">
          <CamposCierre />
          <FormStatus estado={pendiente ? "cargando" : error ? "error" : "inactivo"} mensaje={pendiente ? "Guardando…" : error} />
          <Button type="submit" tamano="lg" cargando={pendiente}>Cerrar consulta</Button>
        </form>
      </Hoja>
    </div>
  );
}
