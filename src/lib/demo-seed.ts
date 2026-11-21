/**
 * Puente para usar la siembra demo desde Server Actions (Ajustes → «Cargar/Borrar datos de demostración»).
 * La implementación vive en prisma/seed/demo/index.ts y usa `db` de src/lib/db.ts.
 */
export { seedDemo, borrarDemo } from "../../prisma/seed/demo";
