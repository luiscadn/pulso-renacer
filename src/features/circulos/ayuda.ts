// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "Círculos y mediaciones",
  pasos: [
    "Entra a «Círculos» para leer las actas de los círculos de bienestar, de la más reciente a la más antigua.",
    "Cada acta tiene cuatro partes: qué funcionó, qué se trabó, cómo está la carga y qué acordamos.",
    "El círculo es cada 15 días, dura 30 minutos y es sin pacientes. Arriba ves cuántos círculos llevamos frente a la meta.",
    "Gestión: en «Círculos y mediaciones» → pestaña Actas, llena los cuatro campos (máximo 300 caracteres cada uno) y guarda. Puedes editar un acta con el botón «Editar».",
    "Gestión: en la pestaña Mediaciones registra solo la fecha y el resultado. No escribas nombres ni descripciones.",
    "Gestión: marca «Ya se hizo el seguimiento a la semana» cuando corresponda y actualiza el resultado si cambia.",
    "Gestión: al lado de las mediaciones hay una guía de 5 pasos con casillas para ir marcando. Lo que marques no se guarda.",
    "Si el conflicto involucra a la administradora, media la propietaria.",
  ],
};
