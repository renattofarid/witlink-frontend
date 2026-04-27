import { z } from "zod";

export const liquidacionFormSchema = z.object({
  observaciones: z.string().optional(),
  tecnico1: z.string().min(1, "El Personal 1 es requerido"),
  tecnico2: z.string().optional(),
});

export type LiquidacionFormValues = z.infer<typeof liquidacionFormSchema>;

export const sotSearchSchema = z.object({
  sot: z.string().min(1, "Ingrese el número de SOT"),
});

export type SotSearchFormValues = z.infer<typeof sotSearchSchema>;
