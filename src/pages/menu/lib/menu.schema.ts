import { z } from "zod";

export const menuSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  icono: z.string().min(1, "Requerido"),
  orden: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
});

export type MenuFormValues = z.infer<typeof menuSchema>;

export const opcionMenuSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  ruta: z.string().min(1, "Requerido"),
  icono: z.string().min(1, "Requerido"),
  orden: z.string().min(1, "Requerido"),
  grupo_menu_id: z.number().min(1, "Requerido"),
});

export type OpcionMenuFormValues = z.infer<typeof opcionMenuSchema>;
