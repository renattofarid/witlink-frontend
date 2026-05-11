import { z } from "zod";

export const trasladoCreateSchema = z
  .object({
    tipo: z.enum(["serie", "material"]),
    destino_almacen_id: z.string().min(1, "Seleccione un almacén destino"),
    serie_id: z.string().optional(),
    modo_retirados: z.boolean(),
    material_id: z.string().optional(),
    cantidad: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "serie") {
      if (!data.serie_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["serie_id"],
          message: "Seleccione una serie",
        });
      }
    }
    if (data.tipo === "material") {
      if (!data.material_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["material_id"],
          message: "Seleccione un material",
        });
      }
      const n = Number(data.cantidad);
      if (!data.cantidad || isNaN(n) || n < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cantidad"],
          message: "Ingrese una cantidad válida (mínimo 0.01)",
        });
      }
    }
  });

export type TrasladoCreateFormValues = z.infer<typeof trasladoCreateSchema>;
