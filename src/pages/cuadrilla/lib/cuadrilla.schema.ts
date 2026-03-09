import { z } from "zod";

export const cuadrillaSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
});

export type CuadrillaFormValues = z.infer<typeof cuadrillaSchema>;
