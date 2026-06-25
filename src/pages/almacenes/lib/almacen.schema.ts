import { z } from "zod";

export const almacenSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  codigo: z
    .string()
    .min(1, "Requerido"),
  direccion: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
});

export type AlmacenFormValues = z.infer<typeof almacenSchema>;
