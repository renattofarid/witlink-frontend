import { z } from "zod";

export const tipoUsuarioSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
});

export type TipoUsuarioFormValues = z.infer<typeof tipoUsuarioSchema>;
