import { z } from "zod";

export const trasladoCreateSchema = z.object({
  tipo: z.enum(["serie", "material"]),
  // Solo requerido para corporativos: el almacén de sesión puede ser el
  // "padre" del grupo, que nunca contiene stock propio.
  almacen_origen_id: z.string().optional(),
  destino_almacen_id: z.string().min(1, "Seleccione un almacén destino"),
  modo_retirados: z.boolean(),
  serie_id: z.string().optional(),
  material_id: z.string().optional(),
  cantidad: z.any().optional(),
});

export type TrasladoCreateFormValues = z.infer<typeof trasladoCreateSchema>;
