import { z } from "zod";

export const erSerieSchema = z.object({
  serie_id: z.union([z.string(), z.number()]).nullable(),
  serie: z.string().optional().nullable(),
  mac: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

export const erProductoSchema = z
  .object({
    producto_id: z.union([z.string(), z.number()]).nullable(),
    nombre: z.string().optional().nullable(),
    sap: z.string().optional().nullable(),
    tipo: z.enum(["material", "equipo"]).optional().nullable(),
    cantidad: z.number().min(1, "Mínimo 1"),
    series: z.array(erSerieSchema).optional().nullable(),
  })
  .superRefine((p, ctx) => {
    if (!p.producto_id) {
      ctx.addIssue({
        code: "custom",
        message: "Seleccione un producto.",
        path: ["producto_id"],
      });
    }
    if (p.tipo === "equipo" && (p.series?.length ?? 0) !== p.cantidad) {
      ctx.addIssue({
        code: "custom",
        message: `Este producto es un equipo y debe tener ${p.cantidad} serie(s) asociada(s).`,
        path: ["series"],
      });
    }
  });

export const equipoRetiradoSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  sot: z.string().min(1, "Requerido"),
  tipo: z.enum(["P", "C", "O"], {
    error: "Debe ser P, C, u O",
  }),
  productos: z
    .array(erProductoSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export type ErSerieFormValues = z.infer<typeof erSerieSchema>;
export type ErProductoFormValues = z.infer<typeof erProductoSchema>;
export type EquipoRetiradoFormValues = z.infer<typeof equipoRetiradoSchema>;
