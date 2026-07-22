import { z } from "zod";

export const devolucionHeaderSchema = z.object({
  fecha_emision: z.string().min(1, "Requerido"),
  fecha_traslado: z.string().min(1, "Requerido"),
  destinatario: z.string().min(1, "Requerido"),
  punto_llegada: z.string().min(1, "Requerido"),
  ruc_dni: z.string().min(1, "Requerido"),
  telefono: z.string().optional(),
  observacion: z.string().optional(),
  motivo_traslado: z.string().min(1, "Requerido"),
  numero_guia_referencia: z.string().optional(),
  transportista_nombre: z.string().optional(),
  transportista_documento: z.string().optional(),
  transportista_direccion: z.string().optional(),
  conductor: z.string().optional(),
  licencia_conducir: z.string().optional(),
  placa_vehiculo: z.string().optional(),
  marca_vehiculo: z.string().optional(),
  peso: z.string().optional(),
  numero_bultos: z.string().optional(),
});

export type DevolucionHeaderFormValues = z.infer<typeof devolucionHeaderSchema>;
