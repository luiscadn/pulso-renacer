import { ShieldCheck } from "lucide-react";

/** Aviso de consentimiento, en lenguaje simple, siempre arriba del pulso. */
export function Consentimiento({ extra }: { extra?: string }) {
  return (
    <section aria-labelledby="consent-titulo" className="mb-5 rounded-xl2 border border-primario bg-arena p-4">
      <h2 id="consent-titulo" className="mb-2 flex items-center gap-2 text-lg font-semibold">
        <ShieldCheck aria-hidden className="size-5 text-primario-osc" />
        Tu respuesta es anónima
      </h2>
      <ul className="list-disc space-y-1 pl-5 text-base">
        <li>Responder es voluntario.</li>
        <li>No guardamos tu nombre ni quién eres. Solo guardamos los números que marques y el día.</li>
        <li>Los resultados se muestran juntos, nunca por persona, y solo si hay suficientes respuestas.</li>
        <li>Nadie del equipo ve resultados individuales.</li>
      </ul>
      <p className="mt-2 text-sm text-texto-suave">
        {extra ??
          "Para no repetir, tu celular guarda una marca de «ya respondí esta semana». Es un control suave: no sabe quién eres."}
      </p>
    </section>
  );
}
