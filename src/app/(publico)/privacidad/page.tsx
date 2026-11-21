import Link from "next/link";

export const metadata = { title: "Privacidad" };

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      <div className="flex flex-col gap-2 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <Link href="/inicio" className="flex min-h-11 items-center text-sm font-medium text-primario-osc underline">
        ← Volver
      </Link>
      <header>
        <h1 className="text-3xl font-semibold">Aviso de privacidad</h1>
        <p className="mt-1 text-texto-suave">
          Tratamiento de datos de Pulso Renacer, según la Ley 1581 de 2012 (habeas data) y sus decretos reglamentarios.
        </p>
      </header>

      <Seccion titulo="Quién es responsable">
        <p>
          Renacer Clínica y Spa (Palmira, Valle del Cauca) es responsable de los datos que se registran en Pulso Renacer, la
          herramienta interna de comunicación del equipo.
        </p>
      </Seccion>

      <Seccion titulo="Para qué usamos los datos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Mostrar quién resuelve cada situación y estandarizar los avisos de agenda.</li>
          <li>Saber si las consultas reciben respuesta y quién las decide, para mejorar los roles.</li>
          <li>Responder las sugerencias del equipo en 15 días o menos y mostrar lo que se hizo.</li>
          <li>Medir el clima del equipo con un pulso semanal anónimo.</li>
          <li>Calcular los indicadores de la estrategia de comunicación interna.</li>
        </ul>
      </Seccion>

      <Seccion titulo="Qué NO guardamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Nombres de pacientes ni de compañeras. La bitácora solo registra roles (cabina, recepción, prestadora).</li>
          <li>Las iniciales de la paciente en el semáforo: solo aparecen en el mensaje y nunca se guardan.</li>
          <li>Correos, teléfonos, direcciones IP ni datos del navegador.</li>
          <li>Quién responde el pulso. Las sugerencias anónimas guardan solo la fecha, sin hora.</li>
          <li>Nombres ni descripciones de las mediaciones: solo la fecha y el resultado.</li>
        </ul>
        <p>
          Si decides firmar una sugerencia, tu firma solo la ve el equipo de gestión. Nunca se publica en el muro ni sale en las
          exportaciones.
        </p>
      </Seccion>

      <Seccion titulo="Quién ve qué">
        <ul className="list-disc space-y-1 pl-5">
          <li>El equipo ve el mapa, el muro «Propusiste / Hicimos» y las actas de los círculos.</li>
          <li>Gestión (administradora y secretaria) responde el buzón y registra actas y mediaciones.</li>
          <li>La propietaria ve solo datos agregados en el tablero de indicadores.</li>
        </ul>
      </Seccion>

      <Seccion titulo="La regla de menos de 3">
        <p>
          Ningún promedio, porcentaje o desglose se muestra si se calcula con menos de 3 respuestas (o el umbral que defina la
          organización). En ese caso verás «Datos insuficientes para proteger el anonimato».
        </p>
      </Seccion>

      <Seccion titulo="Cuánto tiempo se conservan">
        <p>
          Los datos se conservan hasta el cierre del piloto de la estrategia, o el tiempo que defina la organización. Después se
          eliminan o se conservan solo como cifras agregadas.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos y a quién acudir">
        <p>
          Puedes conocer, actualizar, rectificar y pedir la eliminación de tus datos, o revocar tu autorización. Pídeselo a la
          administradora de Renacer, en persona o por el canal interno. Como casi todo es anónimo, a veces no será posible
          identificar un registro tuyo; en ese caso te lo explicaremos.
        </p>
      </Seccion>

      <p className="text-sm text-texto-suave">Participar es voluntario. Usar la herramienta no afecta tu evaluación ni tu contrato.</p>
    </main>
  );
}
