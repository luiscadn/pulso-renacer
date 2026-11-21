import { Banner, Button, ButtonLink, Card, CardTitle, Chip, Countdown, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { MENSAJE_INSUFICIENTE } from "@/lib/privacidad";
import { Interactivos } from "./Interactivos";

export const metadata = { title: "Guía visual" };

export default async function UiDemoPage() {
  await requireRole("gestion");
  const hoy = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const dia = 86_400_000;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader titulo="Guía visual" subtitulo="Componentes de src/components/ui" accion={<Button variante="fantasma">Acción</Button>} />
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Botones</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primario</Button>
          <Button variante="secundario">Secundario</Button>
          <Button variante="fantasma">Fantasma</Button>
          <Button variante="peligro">Peligro</Button>
          <Button cargando>Cargando</Button>
        </div>
        <Button tamano="lg">Grande (lg, ancho completo)</Button>
        <ButtonLink href="/inicio" variante="secundario">ButtonLink</ButtonLink>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Chips, banners y cuenta regresiva</h2>
        <div className="flex flex-wrap gap-2">
          <Chip>Neutro</Chip><Chip tono="verde">Verde</Chip><Chip tono="amarillo">Amarillo</Chip><Chip tono="rojo">Rojo</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Countdown limite={new Date(hoy.getTime() + 9 * dia)} />
          <Countdown limite={new Date(hoy.getTime() + 3 * dia)} />
          <Countdown limite={new Date(hoy.getTime() - 2 * dia)} />
        </div>
        <Banner>Info: versión preliminar.</Banner>
        <Banner tipo="aviso">Aviso: no escribas nombres de pacientes.</Banner>
        <Banner tipo="demo">Datos de demostración</Banner>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Tarjetas</h2>
        <Card><CardTitle>Card</CardTitle><p className="text-texto-suave">Contenido de la tarjeta.</p></Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard codigo="I2" titulo="Consultas con respuesta" valor="86 %" lineaBase="62 %" meta="≥ 90 %" estado="en_camino" />
          <StatCard codigo="I7" titulo="Promedio p6" valor={MENSAJE_INSUFICIENTE} meta="≥ 4,2" estado="insuficiente" />
        </div>
        <EmptyState titulo="Todavía no hay registros" descripcion="Cuando registres algo, aparecerá aquí." />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Formularios</h2>
        <Interactivos />
      </section>
    </div>
  );
}
