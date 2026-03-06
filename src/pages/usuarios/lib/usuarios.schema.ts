import { z } from "zod";

export const usuariosSchema = z.object({
  persona_id: z.number({ invalid_type_error: "Requerido" }).min(1, "Debe ser mayor a 0").optional(),
  tipo_usuario_id: z.number({ invalid_type_error: "Requerido" }).min(1, "Debe ser mayor a 0"),
  oficina_id: z.number({ invalid_type_error: "Requerido" }).min(1, "Debe ser mayor a 0"),
  nombre_usuario: z.string().min(1, "Requerido"),
  contraseña: z.string().min(1, "Requerido"),
});

export type UsuariosFormValues = z.infer<typeof usuariosSchema>;
