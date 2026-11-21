import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/** «martes 8 de diciembre» a partir de una columna `@db.Date` (medianoche UTC). */
export function fechaLarga(d: Date): string {
  return format(new TZDate(d.getTime(), "UTC"), "EEEE d 'de' MMMM", { locale: es });
}
