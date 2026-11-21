"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button, Field, FormStatus, Input, Textarea } from "@/components/ui";
import { claveDia } from "@/lib/fechas";
import { MAX_ACTA } from "../esquemas";
import { APARTADOS_ACTA } from "../textos";
import { actualizarActa, crearActa } from "../actions";

type Acta = { id: string; fecha: string; funciono: string; seTrabo: string; carga: string; acordamos: string };

/** Crear (sin `acta`) o editar un acta. Sin nombres de personas ni de pacientes. */
export function FormActa({ acta }: { acta?: Acta }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [estado, setEstado] = useState<{ tipo: "inactivo" | "exito" | "error"; mensaje?: string }>({ tipo: "inactivo" });
  const [version, setVersion] = useState(0);
  const [hoy] = useState(() => claveDia(Date.now()));

  return (
    <form
      key={version}
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (acta) fd.set("id", acta.id);
        setEstado({ tipo: "inactivo" });
        empezar(async () => {
          const r = acta ? await actualizarActa(fd) : await crearActa(fd);
          if (!r.ok) return setEstado({ tipo: "error", mensaje: r.error });
          if (acta) {
            router.push("/gestion/circulos?tab=actas");
          } else {
            setVersion((v) => v + 1);
          }
          setEstado({ tipo: "exito", mensaje: acta ? "Acta actualizada." : "Acta guardada. El equipo ya puede leerla en «Círculos»." });
        });
      }}
    >
      <p className="text-sm text-texto-suave">No escribas nombres de compañeras ni de pacientes. Habla de situaciones, no de personas.</p>
      <Field label="Fecha del círculo">
        <Input type="date" name="fecha" required max={hoy} defaultValue={acta?.fecha ?? hoy} />
      </Field>
      {APARTADOS_ACTA.map((a) => (
        <Field key={a.campo} label={a.titulo}>
          <Textarea
            name={a.campo}
            required
            maxLength={MAX_ACTA}
            placeholder={a.ejemplo}
            defaultValue={acta?.[a.campo] ?? ""}
            className="min-h-24"
          />
        </Field>
      ))}
      <FormStatus
        estado={pendiente ? "cargando" : estado.tipo}
        mensaje={pendiente ? "Guardando…" : estado.mensaje}
      />
      <Button type="submit" tamano="lg" cargando={pendiente} icono={<Save aria-hidden className="size-5" />}>
        {acta ? "Guardar cambios" : "Guardar acta"}
      </Button>
    </form>
  );
}
