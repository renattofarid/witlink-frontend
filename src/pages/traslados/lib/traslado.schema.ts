import { z } from "zod";

export const trasladoCreateSchema = z.object({
  tipo: z.enum(["serie", "material"]),
  destino_almacen_id: z.string().min(1, "Seleccione un almacén destino"),
  modo_retirados: z.boolean(),
  serie_id: z.string().optional(),
  material_id: z.string().optional(),
  cantidad: z.any().optional(),
});

export type TrasladoCreateFormValues = z.infer<typeof trasladoCreateSchema>;
