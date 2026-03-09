import { z } from "zod";

export const oficinaSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  ubigeo: z
    .string()
    .min(1, "Requerido")
    .max(6, "Debe contener como máximo 6 caracteres")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  direccion: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
});

export type OficinaFormValues = z.infer<typeof oficinaSchema>;
