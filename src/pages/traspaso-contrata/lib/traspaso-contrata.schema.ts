import { z } from "zod";

export const traspasoContrataHeaderSchema = z.object({
  fecha: z.string().min(1, "Requerido"),
  ruc_contrata: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  descripcion_contrata: z.string().min(1, "Requerido"),
  direccion_contrata: z.string().min(1, "Requerido"),
  punto_partida_id: z.string().min(1, "Seleccione un punto de partida"),
  conductor: z.string().max(255, "Máximo 255 caracteres").optional(),
  licencia_conducir: z.string().max(50, "Máximo 50 caracteres").optional(),
  placa_vehiculo: z.string().max(20, "Máximo 20 caracteres").optional(),
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
