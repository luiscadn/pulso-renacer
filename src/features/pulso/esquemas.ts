import { z } from "zod";
import { zEscala } from "@/lib/validacion";

/** Las seis afirmaciones del pulso: todas obligatorias, enteros de 1 a 5. */
export const esquemaPulso = z.object({
  p1: zEscala,
  p2: zEscala,
  p3: zEscala,
  p4: zEscala,
  p5: zEscala,
  p6: zEscala,
});

/** La afirmación de roles (p7), que responde gestión. */
export const esquemaPulsoRoles = z.object({ p7: zEscala });
