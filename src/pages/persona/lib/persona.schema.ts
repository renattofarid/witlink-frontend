import { z } from "zod";

export const personaSchema = z.object({
  nombre: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  apellido_paterno: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  apellido_materno: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  dni: z.string().regex(/^[0-9]*$/, "Debe contener solo números"),
  carnet_extranjeria: z.string().max(20).optional(),
  direccion: z
    .string()
    .min(1, "Requerido")
    .regex(/[a-zA-Z]/, "Debe contener al menos un carácter"),
  telefono: z
    .string()
    .refine(
      (val) => !val || /^\+?[0-9]{7,15}$/.test(val),
      "Formato de teléfono inválido",
    ),
  correo: z
    .string()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Correo inválido",
    ),
  tipo_empleado: z.string().optional(),
  cuadrilla_id: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.dni && !data.carnet_extranjeria) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["dni"] });
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Requerido", path: ["carnet_extranjeria"] });
  }
});

export type PersonaFormValues = z.infer<typeof personaSchema>;
