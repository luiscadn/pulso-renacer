# Pulso Renacer: una app para que las dudas dejen de llegar a una sola persona

**Luis Felipe Cadena** · Ingeniería de Sistemas, Universidad Icesi

## El problema

Renacer Clínica y Spa, en Palmira, tiene menos de diez personas. Su propietaria recibe casi todas las dudas y los problemas del equipo:
el 75 % de las colaboradoras dijo que las dificultades terminan escaladas a ella. Las sugerencias no reciben respuesta, la coordinación
de la agenda entre recepción y cabinas genera desgaste, y el equipo no se siente del todo seguro para expresar un desacuerdo
(3,25 sobre 5 en la encuesta). Mi curso de Comunicación Interna y Cultura Organizacional lo diagnosticó; yo debía convertir esa estrategia en
algo que el equipo pudiera usar desde el celular, de pie, entre citas.

## El enfoque

No quise construir un sistema de gestión más. Pulso Renacer **no reemplaza** WhatsApp ni la agenda del spa. Hace cinco cosas:
muestra quién resuelve qué (el mapa «¿A quién acudo?»), estandariza los avisos de retraso y genera el mensaje para WhatsApp, registra
las consultas para medir si reciben respuesta, cierra el ciclo de las sugerencias con un compromiso de respuesta en 15 días, y mide
el clima con un pulso semanal anónimo. Todo esto alimenta un tablero con los 16 indicadores de la estrategia.

Diseñé para un usuario concreto: alguien con el celular en una mano, en 390 píxeles de ancho, con uno o dos toques de margen. Por eso
registrar una consulta toma tres toques y los botones miden al menos 44 píxeles.

## Decisiones de arquitectura

- **Un solo servicio y una sola base de datos.** Next.js 16 con App Router, Server Actions validadas con `zod` y PostgreSQL 16 con Prisma.
  Para menos de diez usuarios, un monolito es más fácil de operar y de explicar que cualquier arquitectura distribuida.
- **Cero costo extra.** Sin analytics, correo ni almacenamiento externo. El piloto corre en planes gratuitos (Render para la web y Neon
  para la base de datos); la ruta a producción tiene su costo calculado en la ficha técnica.
- **Roles sin cuentas.** Dos códigos (equipo y gestión) y una cookie firmada con `jose` (JWT HS256). Para un equipo pequeño, las cuentas
  individuales agregaban fricción sin ganar seguridad real, y lo declaré como riesgo en la ficha técnica.
- **Zona horaria explícita.** Render corre en UTC, pero los días y las semanas son de Bogotá. Toda la lógica pasa por una sola función
  de fechas, para que un cierre de día no se corra cuatro horas.
- **Lógica de indicadores pura.** Los 16 indicadores son funciones sin efectos secundarios con pruebas unitarias para cada borde
  (denominador cero, menos de tres registros, zona horaria). El tablero solo las presenta.
- **Calidad automatizada.** 166 pruebas unitarias con Vitest y un recorrido E2E con Playwright, que recorre los dos roles en un
  celular de 390 píxeles y comprueba que el tablero cambia tras registrar datos.

## La privacidad, como requisito y no como anexo

Por la Ley 1581 de 2012, decidí desde el principio qué **no** guardar: nombres de pacientes ni de compañeras, correos, direcciones IP
ni user-agents. Las sugerencias anónimas guardan solo el día, sin hora. Ningún promedio se muestra con menos de tres respuestas; en
ese caso el tablero dice «Datos insuficientes para proteger el anonimato». Las iniciales de la paciente en el semáforo se usan solo
para armar el mensaje y nunca llegan al servidor.

Un hallazgo del trabajo fue que la privacidad también es de interfaz: al principio, al guardar una respuesta en el buzón, la tarjeta
salía de la lista y el mensaje de confirmación desaparecía con ella. La gestora no sabía si el cambio había quedado guardado. El arreglo
fue llevar la confirmación a la bandeja, y el recorrido E2E lo cubre.

## Resultados del piloto

> **[Completar al cierre del piloto]**
>
> - Periodo del piloto: [fechas] · Línea base: [fechas]
> - Consultas dirigidas a la propietaria (I1): de [valor] a [valor] (meta ≤ 50 % de la línea base)
> - Consultas con respuesta (I2): [valor] (meta ≥ 90 %)
> - Pulso p6 (respuesta que resuelve): [valor] (meta ≥ 4,2)
> - Círculos realizados (I15): [n] de 6
> - Indicadores que cumplen: [n] de 16
> - Participación en el pulso: [n] respuestas por semana (umbral de anonimato: 3)

## Qué aprendí

1. **Una app para un equipo pequeño se gana o se pierde en el primer minuto.** Si pide demasiado, nadie la abre. La versión final tiene
   pocas pantallas y siempre una salida clara.
2. **La medición tiene que ser honesta.** Mostrar un promedio con dos respuestas es mentir con números. Preferí decir «no hay datos
   suficientes» antes que dar una cifra que nadie podía defender.
3. **El software no resuelve la cultura.** La app hace visible quién responde y qué se hizo con cada propuesta, pero el cambio depende de
   que la gestión responda a tiempo. Por eso el tablero mide también eso (I16).
4. **Dejar una salida digna.** Todo se puede exportar a CSV y abrir en Google Sheets. Si el proyecto termina, el equipo no pierde su historia.
