/** Lógica pura del mapa (sin base de datos), para poder probarla. */

/** Minúsculas y sin tildes, para buscar sin preocuparse por cómo se escribió. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export type SituacionBuscable = {
  titulo: string;
  ejemplo: string;
  quienResuelve: string;
  tipo: string;
};

/** ¿La situación coincide con la búsqueda? Cada palabra escrita debe aparecer en título, ejemplo o quién resuelve. */
export function coincideBusqueda(s: SituacionBuscable, busqueda: string): boolean {
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;
  const pajar = normalizar(`${s.titulo} ${s.ejemplo} ${s.quienResuelve}`);
  return palabras.every((p) => pajar.includes(p));
}

export function filtrarSituaciones<T extends SituacionBuscable>(lista: T[], busqueda: string, tipo: string | null): T[] {
  return lista.filter((s) => (tipo ? s.tipo === tipo : true) && coincideBusqueda(s, busqueda));
}

/**
 * Mueve el elemento con `id` una posición (-1 sube, +1 baja) y devuelve los ids en el nuevo orden.
 * Si no se puede mover (extremo o id inexistente) devuelve el mismo orden.
 */
export function reordenar(ids: string[], id: string, direccion: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + direccion;
  if (i < 0 || j < 0 || j >= ids.length) return [...ids];
  const copia = [...ids];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}
