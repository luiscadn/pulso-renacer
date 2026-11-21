// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "Semáforo de agendas",
  pasos: [
    "Entra a «Avisar retraso» cuando una cita se vaya a atrasar o cambiar.",
    "Elige el color: verde si va a tiempo, amarillo si el retraso es de hasta 15 minutos, rojo si es mayor o hay que reprogramar.",
    "Elige la cabina y la hora de la cita. Si es amarillo o rojo, escribe cuántos minutos de retraso, el motivo y lo que propones.",
    "Las iniciales de la paciente son opcionales: solo salen en el mensaje y no se guardan en ninguna parte.",
    "Toca «Generar aviso», revisa el mensaje y toca «Copiar» o «Enviar por WhatsApp». Cualquiera de los dos deja registrado el aviso, sin datos de la paciente.",
    "Avisa con al menos 15 minutos de anticipación. Si es menos, verás un recordatorio amable: no es un regaño, es para coordinar mejor.",
    "Gestión: los avisos registrados alimentan el indicador de anticipación en el tablero.",
  ],
};
