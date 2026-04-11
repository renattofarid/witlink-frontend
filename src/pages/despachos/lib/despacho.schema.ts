import { z } from "zod";

export const despachoSerieSchema = z.object({
  serie: z.string().min(1, "Serie requerida"),
});

export const despachoProductoSchema = z.object({
  producto_id: z.string().min(1, "Seleccione un producto"),
  nombre: z.string().optional().nullable(),
  sap: z.string().optional().nullable(),
  cantidad: z.coerce.number().min(1, "Mínimo 1"),
  series: z.array(despachoSerieSchema).optional().nullable(),
});

export const despachoCreateSchema = z.object({
  tecnico_id: z.string().min(1, "Seleccione un técnico"),
  productos: z
    .array(despachoProductoSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export const despachoMasivoSchema = z.object({
  tecnico_id: z.string().min(1, "Seleccione un técnico"),
  series_text: z.string().min(1, "Ingrese al menos una serie"),
});

export type DespachoSerieFormValues = z.infer<typeof despachoSerieSchema>;
export type DespachoProductoFormValues = z.infer<typeof despachoProductoSchema>;
export type DespachoCreateFormValues = z.infer<typeof despachoCreateSchema>;
export type DespachoMasivoFormValues = z.infer<typeof despachoMasivoSchema>;
