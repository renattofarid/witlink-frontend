import { z } from "zod";

export const traspasoContrataHeaderSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  ruc_contrata: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  descripcion_contrata: z.string().min(1, "Requerido"),
  direccion_contrata: z.string().min(1, "Requerido"),
  observaciones: z.string().optional(),
});

export type TraspasoContrataHeaderFormValues = z.infer<
  typeof traspasoContrataHeaderSchema
>;

export const traspasoContrataMaterialSchema = z.object({
  producto_id: z.string().min(1, "Seleccione un producto"),
  cantidad: z.coerce.number().min(1, "Mínimo 1 unidad"),
});

export type TraspasoContrataMaterialFormValues = z.infer<
  typeof traspasoContrataMaterialSchema
>;
