import { z } from "zod";

export const despachoSerieSchema = z.object({
  serie_id: z.union([z.string(), z.number()]).optional().nullable(),
  serie: z.string().optional().nullable(),
});

export const despachoProductoSchema = z.object({
  producto_id: z.string().min(1, "Seleccione un producto"),
  nombre: z.string().optional().nullable(),
  sap: z.string().optional().nullable(),
  tipo: z.enum(["MATERIAL", "EQUIPO"]).optional().nullable(),
  cantidad: z.coerce.number().min(1, "Mínimo 1"),
  series: z.array(despachoSerieSchema).optional().nullable(),
});

export const despachoCreateSchema = z.object({
  tecnico_id: z.string().min(1, "Seleccione un técnico"),
  // Solo requerido para corporativos: el almacén de sesión puede ser el
  // "padre" del grupo, que nunca contiene stock propio.
  almacen_id: z.union([z.string(), z.number()]).optional().nullable(),
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
