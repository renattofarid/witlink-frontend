import { z } from "zod";

export const productoSchema = z.object({
  categoria_id: z.string().min(1, "Requerido"),
  sap: z.string().min(1, "Requerido").max(50, "Máximo 50 caracteres"),
  nombre: z.string().min(1, "Requerido").max(255, "Máximo 255 caracteres"),
  tipo: z.enum(["consumible", "equipo"], { message: "Requerido" }),
});

export type ProductoFormValues = z.infer<typeof productoSchema>;
