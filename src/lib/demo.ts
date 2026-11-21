/** ¿La instancia corre en modo demostración? (variable de entorno DEMO_MODE=true) */
export function esModoDemo(): boolean {
  return process.env.DEMO_MODE === "true";
}

/**
 * Filtro para lecturas que alimentan indicadores: en modo demo se ven todas las filas;
 * fuera de él, los datos demo nunca cuentan.
 */
export function filtroDemo(): { esDemo?: false } {
  return esModoDemo() ? {} : { esDemo: false };
}
