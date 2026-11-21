"use client";
import { ArrowDown, ArrowUp, BadgeCheck, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Button, Card, Chip, ChoiceCards, Field, FormStatus, Input, Select, Textarea } from "@/components/ui";
import { alternarActiva, guardarSituacion, marcarValidada, moverSituacion } from "../actions";

export type FilaMapa = {
  id: string;
  titulo: string;
  ejemplo: string;
  tipo: string;
  tipoEtiqueta: string;
  quienResuelve: string;
  tiempoEsperado: string;
  cuandoEscalar: string;
  comoHacerlo: string | null;
  porValidar: boolean;
  activo: boolean;
};

type Estado = { estado: "inactivo" | "cargando" | "exito" | "error"; mensaje?: string };

export function GestionMapa({ filas, tipos }: { filas: FilaMapa[]; tipos: { valor: string; etiqueta: string }[] }) {
  const [editando, setEditando] = useState<FilaMapa | "nueva" | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [estado, setEstado] = useState<Estado>({ estado: "inactivo" });

  function correr(fn: () => Promise<{ ok: boolean; error?: string }>, exito: string) {
    setEstado({ estado: "cargando", mensaje: "Guardando…" });
    iniciar(async () => {
      const r = await fn();
      setEstado(r.ok ? { estado: "exito", mensaje: exito } : { estado: "error", mensaje: r.error });
    });
  }

  if (editando) {
    return <Formulario key={editando === "nueva" ? "nueva" : editando.id} inicial={editando === "nueva" ? null : editando} tipos={tipos} onTerminar={() => setEditando(null)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button tamano="lg" icono={<Plus aria-hidden className="size-5" />} onClick={() => { setEstado({ estado: "inactivo" }); setEditando("nueva"); }}>
        Nueva tarjeta
      </Button>
      <FormStatus estado={estado.estado} mensaje={estado.mensaje} />
      <ul className="flex flex-col gap-3">
        {filas.map((f, i) => (
          <li key={f.id}>
            <Card className={f.activo ? "" : "opacity-70"}>
              <div className="flex flex-wrap items-center gap-2">
                <Chip>{f.tipoEtiqueta}</Chip>
                {f.porValidar && <Chip tono="amarillo">Por validar</Chip>}
                {!f.activo && <Chip tono="rojo">Desactivada</Chip>}
              </div>
              <p className="mt-2 text-lg font-semibold leading-snug">{f.titulo}</p>
              <p className="text-base text-texto-suave">Resuelve: {f.quienResuelve}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variante="secundario" aria-label={`Subir «${f.titulo}»`} disabled={pendiente || i === 0} icono={<ArrowUp aria-hidden className="size-5" />} onClick={() => correr(() => moverSituacion({ id: f.id, direccion: -1 }), "Cambiamos el orden.")}>
                  Subir
                </Button>
                <Button variante="secundario" aria-label={`Bajar «${f.titulo}»`} disabled={pendiente || i === filas.length - 1} icono={<ArrowDown aria-hidden className="size-5" />} onClick={() => correr(() => moverSituacion({ id: f.id, direccion: 1 }), "Cambiamos el orden.")}>
                  Bajar
                </Button>
                <Button variante="secundario" aria-label={`Editar «${f.titulo}»`} icono={<Pencil aria-hidden className="size-5" />} onClick={() => { setEstado({ estado: "inactivo" }); setEditando(f); }}>
                  Editar
                </Button>
                <Button variante="fantasma" disabled={pendiente} aria-label={`${f.activo ? "Desactivar" : "Activar"} «${f.titulo}»`} icono={f.activo ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />} onClick={() => correr(() => alternarActiva({ id: f.id }), f.activo ? "La tarjeta quedó desactivada." : "La tarjeta quedó activa.")}>
                  {f.activo ? "Desactivar" : "Activar"}
                </Button>
                {f.porValidar && (
                  <Button variante="fantasma" disabled={pendiente} aria-label={`Marcar «${f.titulo}» como validada`} icono={<BadgeCheck aria-hidden className="size-5" />} onClick={() => correr(() => marcarValidada({ id: f.id }), "Marcamos la tarjeta como validada.")}>
                    Marcar como validada
                  </Button>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Formulario({ inicial, tipos, onTerminar }: { inicial: FilaMapa | null; tipos: { valor: string; etiqueta: string }[]; onTerminar: () => void }) {
  const [estado, setEstado] = useState<Estado>({ estado: "inactivo" });
  const [pendiente, iniciar] = useTransition();

  function enviar(fd: FormData) {
    setEstado({ estado: "cargando", mensaje: "Guardando…" });
    iniciar(async () => {
      const r = await guardarSituacion(fd);
      if (r.ok) onTerminar();
      else setEstado({ estado: "error", mensaje: r.error });
    });
  }

  return (
    <form action={enviar} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{inicial ? "Editar tarjeta" : "Nueva tarjeta"}</h2>
      {inicial && <input type="hidden" name="id" value={inicial.id} />}
      <Field label="Título">
        <Input name="titulo" required maxLength={120} defaultValue={inicial?.titulo} />
      </Field>
      <Field label="Ejemplo" ayuda="Una situación concreta, en palabras del día a día.">
        <Textarea name="ejemplo" required maxLength={300} defaultValue={inicial?.ejemplo} rows={3} />
      </Field>
      <Field label="Tipo de situación">
        <Select name="tipo" required opciones={tipos} defaultValue={inicial?.tipo ?? "AGENDA"} />
      </Field>
      <Field label="Quién resuelve">
        <Input name="quienResuelve" required maxLength={120} defaultValue={inicial?.quienResuelve} />
      </Field>
      <Field label="Tiempo esperado">
        <Input name="tiempoEsperado" required maxLength={80} defaultValue={inicial?.tiempoEsperado} />
      </Field>
      <Field label="Cuándo escalar a la propietaria">
        <Textarea name="cuandoEscalar" required maxLength={300} defaultValue={inicial?.cuandoEscalar} rows={3} />
      </Field>
      <Field label="Cómo hacerlo" opcional>
        <Textarea name="comoHacerlo" maxLength={300} defaultValue={inicial?.comoHacerlo ?? ""} rows={3} />
      </Field>
      <ChoiceCards name="porValidar" leyenda="¿Ya se validó con el equipo?" columnas={2} valorInicial={inicial && !inicial.porValidar ? "false" : "true"} opciones={[{ valor: "true", etiqueta: "Por validar" }, { valor: "false", etiqueta: "Validada" }]} />
      <ChoiceCards name="activo" leyenda="¿Se muestra al equipo?" columnas={2} valorInicial={inicial && !inicial.activo ? "false" : "true"} opciones={[{ valor: "true", etiqueta: "Activa" }, { valor: "false", etiqueta: "Desactivada" }]} />
      <FormStatus estado={estado.estado} mensaje={estado.mensaje} />
      <div className="flex gap-2">
        <Button type="submit" tamano="lg" cargando={pendiente}>Guardar</Button>
        <Button variante="secundario" onClick={onTerminar} disabled={pendiente}>Cancelar</Button>
      </div>
    </form>
  );
}
