// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "Buzón «Propusiste / Hicimos»",
  pasos: [
    "Entra a «Proponer mejora», elige el tema y cuéntanos tu idea (hasta 800 caracteres).",
    "Si quieres, activa «Firmar mi propuesta» y escribe tu nombre. Sin firma, tu propuesta es anónima y solo guardamos el día.",
    "Evita nombres de compañeras o pacientes. Si es un tema entre personas, habla en privado con la administradora (mediación).",
    "Al enviar verás la fecha límite: te respondemos en 15 días o menos.",
    "En «Propusiste / Hicimos» ves lo que se propuso y lo que hicimos con cada idea. Allí nunca aparece el texto original ni la firma.",
    "Gestión: en la bandeja del buzón las propuestas salen ordenadas por fecha límite. Abre una, escribe el resumen público (parafraseado, sin datos que identifiquen a nadie) y la respuesta, y activa «Publicar en el muro».",
  ],
};
