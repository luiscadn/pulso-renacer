// Instrucciones de uso del módulo, en lenguaje simple. Las compone la página /ayuda.
export const ayuda: { titulo: string; pasos: string[]; soloGestion?: boolean } = {
  titulo: "Bitácora de consultas",
  pasos: [
    "La bitácora sirve para saber qué dudas llegan, a quién se las hacen y si reciben respuesta. No es para evaluar a nadie.",
    "No escribas nombres de pacientes ni de compañeras. Aquí solo se registran roles (Cabina, Recepción, Prestadora…).",
    "Cuando tengas una consulta, entra a «Nueva» y toca tres veces: quién consulta, sobre qué es y a quién se dirigió. Se guarda sola al tercer toque.",
    "En «Abiertas» ves las consultas que todavía no tienen cierre. Si pasan de 24 horas aparece un aviso rojo.",
    "Cuando la consulta se resuelva, toca «Cerrar» y responde: si recibió respuesta, quién decidió finalmente y si se escaló a la propietaria (y por qué).",
    "Si olvidaste registrar una consulta que ya se resolvió, usa «Ya resuelta». Puedes registrar hasta 14 días atrás.",
    "En «Recientes» ves lo cerrado en los últimos 30 días. Si una decisión de un rol delegado fue cambiada después, toca «Marcar como revertida» y elige quién la revirtió.",
  ],
};
