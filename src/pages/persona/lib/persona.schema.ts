import { z } from "zod";

export const personaSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  apellido_paterno: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  apellido_materno: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  dni: z
    .string()
    .min(1, "Requerido")
    .regex(/^[0-9]+$/, "Debe contener solo números"),
  direccion: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  telefono: z
    .string()
    .min(1, "Requerido")
    .regex(/^\+?[0-9]{7,15}$/, "Formato de teléfono inválido"),
  correo: z.email("Correo inválido"),
});

export type PersonaFormValues = z.infer<typeof personaSchema>;
