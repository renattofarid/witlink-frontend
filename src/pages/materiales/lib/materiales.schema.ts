import { z } from "zod";

export const materialSchema = z.object({
  producto_id: z.string({ error: "Requerido" }).min(1, "Requerido"),
  cantidad: z.number({ error: "Requerido" }).positive("Debe ser mayor a 0"),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
