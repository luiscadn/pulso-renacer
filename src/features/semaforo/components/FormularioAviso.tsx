"use client";
import { CircleCheck, Clock, MessageCircle, OctagonAlert, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import type { ColorSemaforo, MotivoAviso } from "@prisma/client";
import { Button, Card, Chip, ChoiceCards, CopyButton, Field, FormStatus, Input, Select, clasesBoton } from "@/components/ui";
import { registrarAviso } from "../actions";
import { ACCION_PROPUESTA, calcularAnticipacion, enlaceWhatsApp, generarMensaje, poca, type AccionPropuesta } from "../logica";

type Props = {
  cabinas: string[];
  motivos: { valor: string; etiqueta: string }[];
};

type Generado = { mensaje: string; minutosAnticipacion: number; color: ColorSemaforo; motivo: MotivoAviso; minutosRetraso?: number };

export function FormularioAviso({ cabinas, motivos }: Props) {
  const [color, setColor] = useState<ColorSemaforo | null>(null);
  const [cabina, setCabina] = useState(cabinas[0] ?? "");
  const [horaCita, setHoraCita] = useState("");
  const [retraso, setRetraso] = useState("");
  const [motivo, setMotivo] = useState<MotivoAviso>("RETRASO_PACIENTE");
  const [accion, setAccion] = useState<AccionPropuesta>("ESPERAR");
  const [iniciales, setIniciales] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [generado, setGenerado] = useState<Generado | null>(null);
  const [estado, setEstado] = useState<{ estado: "inactivo" | "cargando" | "exito" | "error"; mensaje?: string }>({ estado: "inactivo" });
  const registrado = useRef<string | null>(null);

  const conRetraso = color === "AMARILLO" || color === "ROJO";

  function cambiar<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setGenerado(null);
      setEstado({ estado: "inactivo" });
    };
  }

  function generar(e: React.FormEvent) {
    e.preventDefault();
    const nuevos: Record<string, string> = {};
    if (!color) nuevos.color = "Elige un color.";
    if (!cabina) nuevos.cabina = "Elige la cabina.";
    if (!horaCita) nuevos.horaCita = "Escribe la hora de la cita.";
    if (conRetraso && (retraso === "" || Number(retraso) < 0)) nuevos.retraso = "Escribe cuántos minutos de retraso.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length || !color) return;
    const minutosRetraso = conRetraso ? Number(retraso) : undefined;
    const mensaje = generarMensaje({
      color,
      cabina,
      horaCita,
      minutosRetraso,
      motivo: conRetraso ? motivo : "OTRO",
      accion: conRetraso ? accion : null,
      iniciales,
    });
    setGenerado({ mensaje, minutosAnticipacion: calcularAnticipacion(horaCita), color, motivo: conRetraso ? motivo : "OTRO", minutosRetraso });
    registrado.current = null;
    setEstado({ estado: "inactivo" });
  }

  /** Registra el aviso una sola vez por mensaje generado. Las iniciales nunca viajan al servidor. */
  async function registrar() {
    if (!generado || registrado.current === generado.mensaje) return;
    registrado.current = generado.mensaje;
    setEstado({ estado: "cargando", mensaje: "Registrando…" });
    const r = await registrarAviso({
      color: generado.color,
      motivo: generado.motivo,
      minutosRetraso: generado.minutosRetraso,
      minutosAnticipacion: generado.minutosAnticipacion,
    });
    if (r.ok) setEstado({ estado: "exito", mensaje: "Listo, quedó registrado el aviso." });
    else {
      registrado.current = null;
      setEstado({ estado: "error", mensaje: `${r.error} El mensaje sigue disponible para que lo envíes.` });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-xl2 bg-arena p-3 text-base">
        <Clock aria-hidden className="mr-1.5 inline size-4 align-text-bottom" />
        Avisa con al menos 15 minutos de anticipación.
      </p>
      <form onSubmit={generar} className="flex flex-col gap-5" noValidate>
        <ChoiceCards
          name="color"
          leyenda="¿Cómo va la cita?"
          valor={color}
          onChange={cambiar(setColor)}
          error={errores.color}
          opciones={[
            { valor: "VERDE", etiqueta: "Verde", descripcion: "A tiempo", icono: <CircleCheck className="size-7 text-verde-texto" /> },
            { valor: "AMARILLO", etiqueta: "Amarillo", descripcion: "Retraso de hasta 15 minutos", icono: <TriangleAlert className="size-7 text-amarillo-texto" /> },
            { valor: "ROJO", etiqueta: "Rojo", descripcion: "Retraso mayor o reprogramación", icono: <OctagonAlert className="size-7 text-rojo-texto" /> },
          ]}
        />
        <Field label="Cabina" error={errores.cabina}>
          <Select value={cabina} onChange={(e) => cambiar(setCabina)(e.target.value)} opciones={cabinas.map((c) => ({ valor: c, etiqueta: c }))} />
        </Field>
        <Field label="Hora de la cita" error={errores.horaCita}>
          <Input type="time" value={horaCita} onChange={(e) => cambiar(setHoraCita)(e.target.value)} />
        </Field>
        {conRetraso && (
          <>
            <Field label="Minutos de retraso" error={errores.retraso}>
              <Input type="number" inputMode="numeric" min={0} max={600} value={retraso} onChange={(e) => cambiar(setRetraso)(e.target.value)} />
            </Field>
            <Field label="Motivo">
              <Select value={motivo} onChange={(e) => cambiar(setMotivo)(e.target.value as MotivoAviso)} opciones={motivos} />
            </Field>
            <Field label="¿Qué propones?">
              <Select
                value={accion}
                onChange={(e) => cambiar(setAccion)(e.target.value as AccionPropuesta)}
                opciones={Object.entries(ACCION_PROPUESTA).map(([valor, etiqueta]) => ({ valor, etiqueta }))}
              />
            </Field>
          </>
        )}
        <Field label="Iniciales de la paciente" opcional ayuda="Solo salen en el mensaje. No las guardamos.">
          <Input value={iniciales} maxLength={8} autoComplete="off" onChange={(e) => cambiar(setIniciales)(e.target.value)} placeholder="M. R." />
        </Field>
        <Button type="submit" tamano="lg">
          Generar aviso
        </Button>
      </form>

      {generado && (
        <Card aria-label="Vista previa del aviso" className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Así quedó tu aviso</h2>
          <p className="whitespace-pre-wrap rounded-xl2 bg-arena p-3 text-base">{generado.mensaje}</p>
          {poca(generado.minutosAnticipacion) && <Chip tono="amarillo" className="self-start">Aviso con poca anticipación</Chip>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <CopyButton texto={generado.mensaje} onCopiado={registrar} variante="secundario" />
            <a
              href={enlaceWhatsApp(generado.mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={registrar}
              className={clasesBoton("primario", "md")}
            >
              <MessageCircle aria-hidden className="size-5" />
              Enviar por WhatsApp
            </a>
          </div>
          <FormStatus estado={estado.estado} mensaje={estado.mensaje} />
        </Card>
      )}
    </div>
  );
}
