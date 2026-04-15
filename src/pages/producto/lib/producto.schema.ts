import { z } from "zod";

export const productoSchema = z
  .object({
    categoria_id: z.string().min(1, "Requerido"),
    sap: z.string().max(50, "Máximo 50 caracteres").optional(),
    nombre: z.string().min(1, "Requerido").max(255, "Máximo 255 caracteres"),
    tipo: z.enum(["MATERIAL", "EQUIPO"], { message: "Requerido" }),
    origen: z.enum(["CLARO", "WITLINK"], { message: "Requerido" }),
    necesita_serie: z.boolean().nullable().optional(),
    necesita_mac: z.boolean().nullable().optional(),
    necesita_emta_mac: z.boolean().nullable().optional(),
    necesita_ua: z.boolean().nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.origen === "CLARO" && (!v.sap || v.sap.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        message: "SAP es requerido para productos Claro",
        path: ["sap"],
      });
    }
    if (
      v.tipo === "EQUIPO" &&
      !v.necesita_serie &&
      !v.necesita_mac &&
      !v.necesita_emta_mac &&
      !v.necesita_ua
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Un equipo debe requerir al menos una serie, MAC, EMTA MAC o UA.",
        path: ["necesita_serie"],
      });
    }
  });

export type ProductoFormValues = z.infer<typeof productoSchema>;
