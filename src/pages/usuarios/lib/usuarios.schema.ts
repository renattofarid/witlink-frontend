import { z } from "zod";

export const usuariosSchema = z.object({
  persona_id: z.string().min(1, "Requerido").optional(),
  tipo_usuario_id: z.string().min(1, "Requerido"),
  oficina_id: z.string().min(1, "Requerido"),
  nombre_usuario: z.string().min(1, "Requerido"),
  contraseña: z.string().min(1, "Requerido"),
});

export type UsuariosFormValues = z.infer<typeof usuariosSchema>;
