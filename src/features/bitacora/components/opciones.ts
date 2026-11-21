import type { Opcion } from "@/components/ui";
import { DECISOR, DESTINATARIO, MOTIVO_ESCALAMIENTO, ROL_CONSULTANTE, TIEMPO_RESPUESTA, TIPO_SITUACION } from "@/lib/labels";

function deRecord<V extends string>(r: Record<V, string>): Opcion<V>[] {
  return (Object.keys(r) as V[]).map((valor) => ({ valor, etiqueta: r[valor] }));
}

export const opcionesRol = deRecord(ROL_CONSULTANTE);
export const opcionesTipo = deRecord(TIPO_SITUACION);
export const opcionesDestinatario = deRecord(DESTINATARIO);
export const opcionesMotivo = deRecord(MOTIVO_ESCALAMIENTO);
export const opcionesTiempo = deRecord(TIEMPO_RESPUESTA);
export const opcionesDecisor: Opcion[] = [
  { valor: "ROL_DELEGADO", etiqueta: DECISOR.ROL_DELEGADO, descripcion: "Administradora, secretaria, recepción u otra compañera" },
  { valor: "PROPIETARIA", etiqueta: DECISOR.PROPIETARIA },
];
export const opcionesSiNo: Opcion[] = [
  { valor: "true", etiqueta: "Sí" },
  { valor: "false", etiqueta: "No" },
];
