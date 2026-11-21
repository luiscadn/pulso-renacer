import type { EstadoIndicador } from "./metricas";

export const ESTADOS_TEXTO: Record<EstadoIndicador, string> = {
  cumple: "Cumple",
  en_camino: "En camino",
  no_cumple: "No cumple",
  insuficiente: "Datos insuficientes",
};
