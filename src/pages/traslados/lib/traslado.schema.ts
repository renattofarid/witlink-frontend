import { z } from "zod";

export const trasladoCreateSchema = z.object({
  serie_id: z.string().min(1, "Seleccione una serie"),
  destino_almacen_id: z.string().min(1, "Seleccione un almacén destino"),
  modo_retirados: z.boolean(),
});

export type TrasladoCreateFormValues = z.infer<typeof trasladoCreateSchema>;
