import { z } from "zod";

export const categoriaSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;
