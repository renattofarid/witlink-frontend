import { z } from "zod";

const baseSchema = z.object({
  persona_id: z.string().min(1, "Requerido"),
  tipo_usuario_id: z.string().min(1, "Requerido"),
  almacen_id: z.string().min(1, "Requerido"),
  nombre_usuario: z.string().min(1, "Requerido"),
  contraseña: z.string(),
});

export const usuariosCreateSchema = baseSchema.extend({
  contraseña: z.string().min(1, "Requerido"),
});

export const usuariosEditSchema = baseSchema.extend({
  contraseña: z.string().optional(),
});

export type UsuariosFormValues = z.infer<typeof baseSchema>;
