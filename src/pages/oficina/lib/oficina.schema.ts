import { z } from "zod";

export const oficinaSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  ubigeo: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  direccion: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
});

export type OficinaFormValues = z.infer<typeof oficinaSchema>;
