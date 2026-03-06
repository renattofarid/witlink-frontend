import { z } from "zod";

export const cuadrillaSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
});

export type CuadrillaFormValues = z.infer<typeof cuadrillaSchema>;
