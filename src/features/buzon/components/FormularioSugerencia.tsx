"use client";
import { useActionState, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Banner, Button, ButtonLink, Card, ChoiceCards, Field, FormStatus, Input, Textarea } from "@/components/ui";
import { CATEGORIA_SUGERENCIA } from "@/lib/labels";
import type { Resultado } from "@/lib/validacion";
import { enviarSugerencia } from "../actions";
import { MAX_FIRMA, MAX_TEXTO } from "../esquemas";

const OPCIONES = Object.entries(CATEGORIA_SUGERENCIA).map(([valor, etiqueta]) => ({ valor, etiqueta }));

/** Al elegir «Enviar otra», cambia la `key` y el formulario vuelve a empezar limpio. */
export function FormularioSugerencia() {
  const [intento, setIntento] = useState(0);
  return <Formulario key={intento} otra={() => setIntento((n) => n + 1)} />;
}

function Formulario({ otra }: { otra: () => void }) {
  const [estado, enviar, pendiente] = useActionState<Resultado<{ limite: string }> | null, FormData>(enviarSugerencia, null);
  const [firmar, setFirmar] = useState(false);

  if (estado?.ok) {
    return (
      <Card className="flex flex-col items-center gap-4 py-8 text-center" role="status">
        <CheckCircle2 aria-hidden className="size-12 text-verde-texto" />
        <p className="max-w-sm text-lg font-medium">
          Recibimos tu propuesta. Te respondemos a más tardar el {estado.data.limite}.
        </p>
        <p className="text-base text-texto-suave">Cuando la respondamos, la verás en «Propusiste / Hicimos».</p>
        <div className="flex w-full flex-col gap-2">
          <ButtonLink href="/muro" tamano="lg">
            Ver lo que hemos hecho
          </ButtonLink>
          <Button variante="secundario" tamano="lg" onClick={otra}>
            Enviar otra propuesta
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form action={enviar} className="flex flex-col gap-5">
      <ChoiceCards name="categoria" leyenda="¿Sobre qué es tu propuesta?" opciones={OPCIONES} columnas={2} requerido />
      <Field label="Cuéntanos tu idea" ayuda="Qué cambiarías y por qué. Máximo 800 caracteres.">
        <Textarea name="texto" maxLength={MAX_TEXTO} required minLength={10} rows={6} />
      </Field>
      <Banner tipo="info">
        Evita nombres de compañeras o pacientes. Los temas entre personas se hablan en privado con la administradora (mediación).
      </Banner>
      <div className="flex flex-col gap-3 rounded-xl2 border border-borde bg-white p-3">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-medium">
          <input
            type="checkbox"
            name="firmar"
            checked={firmar}
            onChange={(e) => setFirmar(e.target.checked)}
            className="size-6 accent-primario-osc"
          />
          Firmar mi propuesta
        </label>
        {firmar ? (
          <Field label="Tu nombre" ayuda="Solo lo ve la administración; nunca aparece en el muro.">
            <Input name="firma" maxLength={MAX_FIRMA} required autoComplete="off" />
          </Field>
        ) : (
          <p className="flex items-start gap-2 text-sm text-texto-suave">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
            Sin firma, tu propuesta es anónima: solo guardamos el día en que la enviaste, sin hora.
          </p>
        )}
      </div>
      <Button type="submit" tamano="lg" cargando={pendiente}>
        Enviar propuesta
      </Button>
      <FormStatus
        estado={pendiente ? "cargando" : estado && !estado.ok ? "error" : "inactivo"}
        mensaje={pendiente ? "Enviando…" : estado && !estado.ok ? estado.error : undefined}
      />
    </form>
  );
}
