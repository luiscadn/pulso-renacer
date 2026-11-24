"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Punto = { semana: string; valor: number | null; n: number };

/** Mini gráfica semanal. Las semanas con pocos datos (n < umbral) llegan con valor null y quedan como hueco. */
export function Tendencia({ puntos, titulo, umbral }: { puntos: Punto[]; titulo: string; umbral: number }) {
  const hayValores = puntos.filter((p) => p.valor !== null).length;
  if (hayValores < 2) {
    return <p className="text-sm text-texto-suave">Se necesitan al menos 2 semanas con {umbral} registros o más para ver la tendencia.</p>;
  }
  const resumenTexto = puntos.map((p) => `${p.semana}: ${p.valor === null ? "datos insuficientes" : `${Math.round(p.valor)} %`}`).join("; ");
  return (
    <div role="img" aria-label={`Tendencia semanal de ${titulo}. ${resumenTexto}`} className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={puntos} margin={{ top: 6, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="semana" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            formatter={(v) => (typeof v === "number" ? `${Math.round(v)} %` : "Datos insuficientes")}
            labelFormatter={(l) => `Semana ${String(l).split("-W")[1] ?? l}`}
          />
          <Line type="monotone" dataKey="valor" stroke="#8C4256" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
