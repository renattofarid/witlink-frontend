import { z } from "zod";

const serieSchema = z.object({
  serie: z.string().min(1, "Requerido"),
  mac: z.string().min(1, "Requerido"),
  ua: z.string().min(1, "Requerido"),
  observaciones: z.string().optional().nullable(),
});

const productoSchema = z.object({
  producto_id: z.string().optional().nullable(),
  categoria_id: z.string().optional().nullable(),
  sap: z.string().optional().nullable(),
  nombre: z.string().optional().nullable(),
  tipo: z.enum(["consumible", "equipo"]).optional().nullable(),
  cantidad: z.number().min(1, "Mínimo 1"),
  observaciones: z.string().optional().nullable(),
  series: z.array(serieSchema).optional().nullable(),
});

export const guiaCreateSchema = z.object({
  numero: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  proveedor_id: z.string().min(1, "Requerido"),
  productos: z.array(productoSchema).min(1, "Debe agregar al menos un producto"),
});

export const guiaEditSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
});

export type GuiaCreateFormValues = z.infer<typeof guiaCreateSchema>;
export type GuiaEditFormValues = z.infer<typeof guiaEditSchema>;
