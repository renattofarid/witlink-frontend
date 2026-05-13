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
    tipo: z.enum(["MATERIAL", "EQUIPO"]).optional().nullable(),
    origen: z.string().optional().nullable(),
    necesita_serie: z.boolean().optional().nullable(),
    necesita_mac: z.boolean().optional().nullable(),
    necesita_emta_mac: z.boolean().optional().nullable(),
    necesita_ua: z.boolean().optional().nullable(),
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
  });

export const equipoRetiradoSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  sot: z.string().min(1, "Requerido"),
  tipo: z.enum(["P", "C", "O"], {
    error: "Debe ser P, C u O",
  }),
  productos: z
    .array(erProductoSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export const equipoRetiradoEditHeaderSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  sot: z.string().min(1, "Requerido"),
  tipo: z.enum(["P", "C", "O"], {
    error: "Debe ser P, C u O",
  }),
});

export type ErSerieFormValues = z.infer<typeof erSerieSchema>;
export type ErProductoFormValues = z.infer<typeof erProductoSchema>;
export type EquipoRetiradoFormValues = z.infer<typeof equipoRetiradoSchema>;
export type EquipoRetiradoEditHeaderValues = z.infer<
  typeof equipoRetiradoEditHeaderSchema
>;
