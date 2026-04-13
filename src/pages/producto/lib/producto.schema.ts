import { z } from "zod";

export const productoSchema = z
  .object({
    categoria_id: z.string().min(1, "Requerido"),
    sap: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
    nombre: z.string().min(1, "Requerido").max(255, "Máximo 255 caracteres"),
    tipo: z.enum(["material", "equipo"], { message: "Requerido" }),
    origen: z.enum(["claro", "witlink"], { message: "Requerido" }),
    necesita_serie: z.boolean().nullable().optional(),
    necesita_mac: z.boolean().nullable().optional(),
    necesita_emta_mac: z.boolean().nullable().optional(),
    necesita_ua: z.boolean().nullable().optional(),
  })
  .superRefine((v, ctx) => {
    if (
      v.tipo === "equipo" &&
      !v.necesita_serie &&
      !v.necesita_mac &&
      !v.necesita_emta_mac &&
      !v.necesita_ua
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Un equipo debe requerir al menos una serie, MAC, EMTA MAC o UA.",
        path: ["necesita_serie"],
      });
    }
  });

export type ProductoFormValues = z.infer<typeof productoSchema>;
