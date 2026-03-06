import { z } from "zod";

export const guiaSchema = z.object({
  ruc: z.string().min(1, "Requerido"),
  razon_social: z.string().min(1, "Requerido"),
  telefono: z.string().min(1, "Requerido"),
  direccion: z.string().min(1, "Requerido"),
});

export type GuiaFormValues = z.infer<typeof guiaSchema>;
