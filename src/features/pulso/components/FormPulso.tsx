"use client";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button, FormStatus, Likert } from "@/components/ui";
import type { Resultado } from "@/lib/validacion";

type Pregunta = { clave: string; texto: string };

/**
 * Formulario de escala 1–5. Sirve para el pulso (p1–p6) y para el pulso de roles (p7).
 * Todas las afirmaciones son obligatorias. Al terminar solo se da las gracias: no se muestran resultados.
 */
export function FormPulso({
  preguntas,
  accion,
  textoEnviar = "Enviar mis respuestas",
}: {
  preguntas: Pregunta[];
  accion: (fd: FormData) => Promise<Resultado<unknown>>;
  textoEnviar?: string;
}) {
  const [pendiente, empezar] = useTransition();
  const [resultado, setResultado] = useState<Resultado<unknown> | null>(null);
  const [faltan, setFaltan] = useState<string[]>([]);

  if (resultado?.ok) {
    return (
      <div role="status" className="rounded-xl2 bg-[#e3f1e7] p-6 text-center">
        <p className="font-serif text-xl font-semibold text-verde-texto">¡Gracias por responder!</p>
        <p className="mt-2 text-base">Tu respuesta se guardó de forma anónima. Tu voz ayuda a mejorar cómo trabajamos.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const sinResponder = preguntas.filter((p) => !fd.get(p.clave)).map((p) => p.clave);
        setFaltan(sinResponder);
        if (sinResponder.length) {
          setResultado({ ok: false, error: "Falta responder todas las afirmaciones. Marca un número del 1 al 5 en cada una." });
          return;
        }
        setResultado(null);
        empezar(async () => setResultado(await accion(fd)));
      }}
    >
      {preguntas.map((p, i) => (
        <div
          key={p.clave}
          className={faltan.includes(p.clave) ? "rounded-xl2 border-2 border-rojo p-3" : "rounded-xl2 border-2 border-transparent p-3"}
        >
          <Likert name={p.clave} enunciado={`${preguntas.length > 1 ? `${i + 1}. ` : ""}${p.texto}`} requerido />
        </div>
      ))}
      <FormStatus
        estado={pendiente ? "cargando" : resultado && !resultado.ok ? "error" : "inactivo"}
        mensaje={pendiente ? "Enviando…" : resultado && !resultado.ok ? resultado.error : undefined}
      />
      <Button type="submit" tamano="lg" cargando={pendiente} icono={<Send aria-hidden className="size-5" />}>
        {textoEnviar}
      </Button>
    </form>
  );
}
