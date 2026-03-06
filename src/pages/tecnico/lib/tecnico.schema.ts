import { z } from "zod";

export const tecnicoCreateSchema = z.object({
  cuadrilla_id: z.string().min(1, "Seleccione una cuadrilla"),
  persona_id: z.string().min(1, "Seleccione una persona"),
});

export const tecnicoEditSchema = z.object({
  cuadrilla_id: z.string().min(1, "Seleccione una cuadrilla"),
});

export type TecnicoFormValues = {
  cuadrilla_id: string;
  persona_id: string;
};
