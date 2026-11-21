# Guion de demo en vivo · 2 minutos

**Objetivo:** mostrar el problema (dudas que llegan a una sola persona), la solución en el celular del equipo y el cierre en la
bandeja de gestión y el tablero. Todo en menos de dos minutos.

## Antes de empezar (5 minutos antes)

1. **Abre https://pulso-renacer.onrender.com en el celular y en el computador.** El plan gratuito se duerme sin uso y la primera carga tarda.
   No empieces la demo con la app dormida. El QR de acceso está en `docs/entrega/qr-acceso.png` para mostrarlo en pantalla.
2. **Ingresa como equipo en el celular** y como **gestión en el computador**. Ten los códigos a mano en papel, no en pantalla.
3. Confirma que aparece el banner **«Datos de demostración»**: así el público sabe que los números son de ejemplo.
4. Pon el celular en **390 px de ancho** (o usa el modo de dispositivo del navegador) y el computador a pantalla completa en `/gestion/tablero`.
5. Ten la pestaña de **Bitácora** en «Abiertas» y el **pulso** sin responder en otra pestaña.

## Guion (cronómetro)

| Tiempo | Dónde | Qué tocar | Qué decir |
|---|---|---|---|
| 0:00 – 0:15 | Celular · Inicio | Muestra el mosaico de botones. | «Renacer tiene menos de diez personas y todas las dudas llegaban a la propietaria. Esto es lo que cambió.» |
| 0:15 – 0:35 | Celular · **¿A quién acudo?** | Escribe «turno» y abre la tarjeta. | «Antes de preguntar, cada quien ve quién resuelve qué y cuándo escalar.» |
| 0:35 – 0:55 | Celular · **Avisar retraso** | Amarillo → hora → 10 min → **Generar aviso** → **Copiar**. | «Un aviso estándar para la cabina. Se registra sin datos de la paciente.» |
| 0:55 – 1:10 | Celular · **Bitácora** | **Nueva**: tres toques. | «Tres toques para registrar una consulta. No guardamos nombres.» |
| 1:10 – 1:25 | Celular · **Proponer mejora** | Escribe una frase y **Enviar propuesta**. | «La propuesta tiene fecha límite: respondemos en 15 días.» |
| 1:25 – 1:35 | Computador · **Gestión → Buzón** | Abre la propuesta, escribe la respuesta, activa «Publicar» y **Guardar**. | «La administración responde y publica. Así se cierra el ciclo.» |
| 1:35 – 1:50 | Computador · **Gestión → Tablero** | Muestra el resumen «cumplen / en camino» y abre «¿Cómo se calcula?» en una tarjeta. | «Los 16 indicadores se calculan solos. Si hay menos de tres datos, no se muestran.» |
| 1:50 – 2:00 | Computador · **Privacidad** | Abre `/privacidad` o la tarjeta de datos insuficientes. | «Lo que no se guarda es tan importante como lo que sí.» Cierra con la URL. |

## Plan B (si algo falla)

- **El servicio tarda en responder:** di «el plan gratuito se duerme; la app ya está lista» y muestra la **captura** de la pantalla que
  falta (`docs/capturas/`). Las capturas están en el repositorio y en el manual.
- **Falla el envío de la propuesta:** salta al tablero y di: «aquí están los números del piloto; el envío lo pueden probar después».
- **Falla todo:** muestra el manual (`docs/entrega/MANUAL-DE-USO.md`) con sus capturas y la tabla de indicadores (`docs/entrega/INDICADORES.md`).
- **Pregunta por datos reales:** responde que el piloto usa datos de demostración; los resultados reales se presentan en el informe.

## Lo que no se hace en vivo

- No escribas códigos ni abras el panel de Render.
- No entres a bases de datos ni muestres la BD.
- No hagas capturas de la pantalla de gestión con nombres reales de compañeras.
