import { z } from "zod";

export const serieSchema = z
  .object({
    serie_id: z.union([z.string(), z.number()]).optional().nullable(),
    serie: z.string().optional().nullable(),
    mac: z.string().optional().nullable(),
    ua: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.serie_id) return; // reingreso: skip format validation
    if (data.mac && !/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(data.mac)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato inválido (ej. 00:1A:2B:3C:4D:5E)",
        path: ["mac"],
      });
    }
    if (data.ua && data.ua.length !== 17) {
      ctx.addIssue({
        code: "custom",
        message: "Debe tener 17 caracteres",
        path: ["ua"],
      });
    }
  });

export const productoSchema = z
  .object({
    producto_id: z.string().optional().nullable(),
    categoria_id: z.string().optional().nullable(),
    sap: z.string().optional().nullable(),
    nombre: z.string().optional().nullable(),
    tipo: z.enum(["material", "equipo"]).optional().nullable(),
    cantidad: z.number().min(1, "Mínimo 1"),
    observaciones: z.string().optional().nullable(),
    series: z.array(serieSchema).optional().nullable(),
  })
  .superRefine((p, ctx) => {
    if (p.tipo !== "equipo") return;
    if ((p.series?.length ?? 0) !== p.cantidad) {
      ctx.addIssue({
        code: "custom",
        message: `Este producto es un equipo y debe tener ${p.cantidad} serie(s) asociada(s).`,
        path: ["series"],
      });
    }
  });

export const guiaCreateSchema = z.object({
  numero: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  proveedor_id: z.string().min(1, "Requerido"),
  productos: z
    .array(productoSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export const guiaEditSchema = guiaCreateSchema;

export type SerieFormValues = z.infer<typeof serieSchema>;
export type ProductoFormValues = z.infer<typeof productoSchema>;
export type GuiaCreateFormValues = z.infer<typeof guiaCreateSchema>;
export type GuiaEditFormValues = GuiaCreateFormValues;
