import { z } from "zod";

export const serieRetiradaSchema = z.object({
  serie_id: z.union([z.string(), z.number()]).refine(
    (v) => v !== "" && v !== null && v !== undefined && Number(v) > 0,
    { message: "Seleccione una serie" },
  ),
  serie: z.string().optional().nullable(),
  mac: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

export const productoRetiradoSchema = z.object({
  producto_id: z.string().min(1, "Seleccione un producto"),
  nombre: z.string().optional().nullable(),
  origen: z.string().optional().nullable(),
  necesita_serie: z.boolean().optional().nullable(),
  necesita_mac: z.boolean().optional().nullable(),
  necesita_emta_mac: z.boolean().optional().nullable(),
  necesita_ua: z.boolean().optional().nullable(),
  cantidad: z.number().min(1, "Mínimo 1"),
  series: z.array(serieRetiradaSchema).optional().nullable(),
}).superRefine((p, ctx) => {
  if (!p.necesita_serie) return;
  if ((p.series?.length ?? 0) !== p.cantidad) {
    ctx.addIssue({
      code: "custom",
      message: `Debe asociar ${p.cantidad} serie(s) a este producto.`,
      path: ["series"],
    });
  }
});

export const equipoRetiradoCreateSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  sot: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  productos: z.array(productoRetiradoSchema).min(1, "Debe agregar al menos un producto"),
});

export const equipoRetiradoEditSchema = z.object({
  sot: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
});

export type SerieRetiradaFormValues = z.infer<typeof serieRetiradaSchema>;
export type ProductoRetiradoFormValues = z.infer<typeof productoRetiradoSchema>;
export type EquipoRetiradoCreateFormValues = z.infer<typeof equipoRetiradoCreateSchema>;
export type EquipoRetiradoEditFormValues = z.infer<typeof equipoRetiradoEditSchema>;
