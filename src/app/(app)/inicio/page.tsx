import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  Compass,
  Download,
  HeartHandshake,
  Inbox,
  Lightbulb,
  Map,
  MessagesSquare,
  Settings,
  Sparkles,
  TrafficCone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { filtroDemo } from "@/lib/demo";

export const metadata = { title: "Inicio" };

type Mosaico = { href: string; titulo: string; descripcion: string; Icono: LucideIcon; contador?: number };

const EQUIPO: Mosaico[] = [
  { href: "/acudo", titulo: "¿A quién acudo?", descripcion: "Quién resuelve qué", Icono: Compass },
  { href: "/semaforo", titulo: "Avisar retraso", descripcion: "Semáforo de agendas", Icono: TrafficCone },
  { href: "/bitacora", titulo: "Registrar consulta", descripcion: "Bitácora", Icono: ClipboardList },
  { href: "/buzon", titulo: "Proponer mejora", descripcion: "Buzón de sugerencias", Icono: Lightbulb },
  { href: "/muro", titulo: "Propusiste / Hicimos", descripcion: "Lo que cambiamos", Icono: Sparkles },
  { href: "/pulso", titulo: "Pulso semanal", descripcion: "Anónimo, 1 minuto", Icono: HeartHandshake },
  { href: "/circulos", titulo: "Círculos", descripcion: "Actas del equipo", Icono: Users },
];

function Tarjeta({ href, titulo, descripcion, Icono, contador }: Mosaico) {
  return (
    <li>
      <Link
        href={href}
        className="relative flex h-full min-h-28 flex-col justify-between gap-2 rounded-xl2 border border-borde bg-white p-4 shadow-suave transition-colors hover:border-primario active:bg-arena"
      >
        <Icono aria-hidden className="size-7 text-primario-osc" />
        <span>
          <span className="block font-semibold leading-snug">{titulo}</span>
          <span className="block text-sm text-texto-suave">{descripcion}</span>
        </span>
        {contador !== undefined && contador > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rojo-texto px-2 py-0.5 text-sm font-semibold text-white">
            {contador}
            <span className="sr-only"> pendientes</span>
          </span>
        )}
      </Link>
    </li>
  );
}

export default async function InicioPage() {
  const { rol } = await requireRole("equipo");
  const esGestion = rol === "gestion";
  const pendientes = esGestion
    ? await db.sugerencia.count({ where: { ...filtroDemo(), respondidaEn: null } })
    : 0;

  const gestion: Mosaico[] = [
    { href: "/gestion/buzon", titulo: "Buzón", descripcion: "Propuestas por responder", Icono: Inbox, contador: pendientes },
    { href: "/gestion/tablero", titulo: "Tablero", descripcion: "Indicadores", Icono: BarChart3 },
    { href: "/gestion/circulos", titulo: "Círculos y mediaciones", descripcion: "Actas y registro", Icono: MessagesSquare },
    { href: "/gestion/mapa", titulo: "Mapa", descripcion: "Editar «¿A quién acudo?»", Icono: Map },
    { href: "/gestion/exportar", titulo: "Exportar", descripcion: "CSV para Excel", Icono: Download },
    { href: "/gestion/ajustes", titulo: "Ajustes", descripcion: "Línea base y más", Icono: Settings },
  ];

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">¡Hola! ¿Qué necesitas hoy?</h1>
      <p className="mb-5 text-texto-suave">Elige una opción. Todo está a pocos toques.</p>
      <ul className="grid grid-cols-2 gap-3">
        {EQUIPO.map((m) => (
          <Tarjeta key={m.href} {...m} />
        ))}
      </ul>
      {esGestion && (
        <section aria-labelledby="titulo-gestion" className="mt-8">
          <h2 id="titulo-gestion" className="mb-3 text-xl font-semibold">
            Gestión
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {gestion.map((m) => (
              <Tarjeta key={m.href} {...m} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
