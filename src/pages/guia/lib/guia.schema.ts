import { z } from "zod";

const serieSchema = z.object({
  serie: z.string().min(1, "Requerido"),
  mac: z.string().min(1, "Requerido"),
  ua: z.string().min(1, "Requerido"),
  observaciones: z.string(),
});

const productoSchema = z.object({
  producto_id: z.string().min(1, "Requerido"),
  categoria_id: z.string().min(1, "Requerido"),
  sap: z.string().min(1, "Requerido"),
  nombre: z.string().min(1, "Requerido"),
  tipo: z.string().min(1, "Requerido"),
  cantidad: z.number().min(1, "Mínimo 1"),
  observaciones: z.string(),
  series: z.array(serieSchema),
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
