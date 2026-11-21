import { z } from "zod";
import { zBool, zCategoriaSugerencia, zEstadoSugerencia, zTexto, zTextoOpcional } from "@/lib/validacion";

export const MAX_TEXTO = 800;
export const MAX_FIRMA = 80;
export const MAX_RESUMEN = 200;

export const esquemaEnviar = z
  .object({
    categoria: zCategoriaSugerencia,
    texto: zTexto(MAX_TEXTO, 10),
    firmar: zBool,
    firma: zTextoOpcional(MAX_FIRMA),
  })
  .superRefine((d, ctx) => {
    if (d.firmar && !d.firma) ctx.addIssue({ code: "custom", path: ["firma"], message: "Escribe tu nombre para firmar o apaga la firma." });
  });

export const esquemaResponder = z
  .object({
    id: z.string().min(1),
    estado: zEstadoSugerencia,
    resumenPublico: zTextoOpcional(MAX_RESUMEN),
    respuesta: zTextoOpcional(800),
    publicada: zBool,
  })
  .superRefine((d, ctx) => {
    if (d.publicada && !d.resumenPublico)
      ctx.addIssue({ code: "custom", path: ["resumenPublico"], message: "Para publicar en el muro escribe el resumen público." });
    if (d.publicada && !d.respuesta)
      ctx.addIssue({ code: "custom", path: ["respuesta"], message: "Para publicar en el muro escribe la respuesta." });
    if ((d.estado === "IMPLEMENTADA" || d.estado === "NO_IMPLEMENTADA") && !d.respuesta)
      ctx.addIssue({ code: "custom", path: ["respuesta"], message: "Cuéntale al equipo qué se hizo (o por qué no) en la respuesta." });
  });
