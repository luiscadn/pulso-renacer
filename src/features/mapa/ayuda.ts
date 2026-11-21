// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "¿A quién acudo?",
  pasos: [
    "Entra a «¿A quién acudo?» cuando tengas una duda y no sepas quién la resuelve.",
    "Escribe unas palabras en el buscador (por ejemplo «descuento» o «turno») o toca un tipo de situación para filtrar.",
    "Toca la tarjeta para abrirla: verás quién resuelve, en cuánto tiempo y cuándo conviene escalar a la propietaria.",
    "Si no encuentras tu caso, registra la consulta en la bitácora y pregúntale a la administradora.",
    "Si ves el aviso «Versión preliminar», es porque el mapa aún se está validando con el equipo en el taller de roles.",
    "Gestión: en «Editar el mapa» puedes crear y editar tarjetas, subirlas o bajarlas, desactivarlas y marcarlas como validadas.",
  ],
};
