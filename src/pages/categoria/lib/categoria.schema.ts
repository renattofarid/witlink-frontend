import { z } from "zod";

export const categoriaSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;
