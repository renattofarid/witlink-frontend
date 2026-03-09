import { z } from "zod";

export const tipoUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
});

export type TipoUsuarioFormValues = z.infer<typeof tipoUsuarioSchema>;
