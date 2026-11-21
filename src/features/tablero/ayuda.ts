// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "Tablero de indicadores",
  soloGestion: true,
  pasos: [
    "Entra a Tablero desde Gestión. Arriba eliges el periodo: 14 días, 30 días o un rango de fechas.",
    "Arriba ves el resumen: cuántos de los 16 indicadores cumplen y cuántos van en camino.",
    "Cada tarjeta muestra el valor del periodo, el valor de la línea base (las semanas de referencia), la meta y un estado.",
    "Cumple: ya alcanzó la meta. En camino: mejoró frente a la línea base pero todavía no llega. No cumple: no ha mejorado. Datos insuficientes: hay muy pocos registros para mostrar el dato.",
    "Toca «¿Cómo se calcula?» en cualquier tarjeta para ver la fórmula en palabras simples.",
    "Para proteger el anonimato, ningún dato se muestra si viene de menos de 3 registros (o del mínimo que definas en Ajustes).",
    "«Imprimir / PDF» abre una versión limpia para anexar al informe. «Exportar» descarga las tablas en CSV para Excel; las sugerencias salen sin firma.",
    "En Ajustes cambias las fechas de la línea base, el mínimo de anonimato, la meta de círculos, las cabinas y el kit. También está el QR para compartir el acceso con el equipo.",
  ],
};
