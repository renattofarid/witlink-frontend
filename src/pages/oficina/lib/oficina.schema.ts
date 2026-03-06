import { z } from "zod";

export const oficinaSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  ubigeo: z.string().min(1, "Requerido"),
  direccion: z.string().min(1, "Requerido"),
});

export type OficinaFormValues = z.infer<typeof oficinaSchema>;
