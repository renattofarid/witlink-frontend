import { z } from "zod";

export const serieSchema = z.object({
  serie: z.string().min(1, "Requerido"),
  situacion: z.string().min(1, "Requerido"),
  mac: z.string().min(1, "Requerido"),
  ua: z.string().min(1, "Requerido"),
  producto_id: z.string().min(1, "Requerido"),
});

export type SerieFormValues = z.infer<typeof serieSchema>;
