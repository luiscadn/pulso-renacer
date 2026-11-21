// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "Pulso semanal",
  pasos: [
    "Entra a «Pulso semanal» una vez por semana. Toma cerca de un minuto.",
    "Lee el aviso de arriba: responder es voluntario y es anónimo. No guardamos tu nombre, solo los números y el día.",
    "Marca del 1 al 5 qué tan de acuerdo estás con cada afirmación (1 = total desacuerdo, 5 = total acuerdo). Todas son obligatorias.",
    "Toca «Enviar mis respuestas». Verás un agradecimiento; no se muestran resultados para que nadie pueda deducir quién respondió qué.",
    "Si ya respondiste esa semana, la app te lo dice y te muestra cuándo puedes volver (el próximo lunes). Tu celular guarda una marca simple de «ya respondí»; no sabe quién eres.",
    "Gestión: en «Pulso de roles» hay una pregunta adicional sobre la autonomía del cargo, con el mismo cuidado por el anonimato.",
  ],
};
