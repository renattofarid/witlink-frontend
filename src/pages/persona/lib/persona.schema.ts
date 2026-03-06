import { z } from "zod";

export const personaSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  apellido_paterno: z.string().min(1, "Requerido"),
  apellido_materno: z.string().min(1, "Requerido"),
  dni: z.string().min(1, "Requerido"),
  direccion: z.string().min(1, "Requerido"),
  telefono: z.string().min(1, "Requerido"),
  correo: z.string().min(1, "Requerido").email("Correo inválido"),
});

export type PersonaFormValues = z.infer<typeof personaSchema>;
