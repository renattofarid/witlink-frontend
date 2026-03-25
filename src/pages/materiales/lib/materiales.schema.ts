import { z } from "zod";

export const materialSchema = z.object({
  producto_id: z
    .string({ required_error: "Requerido" })
    .min(1, "Requerido"),
  cantidad: z
    .number({ required_error: "Requerido", invalid_type_error: "Debe ser un número" })
    .positive("Debe ser mayor a 0"),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
