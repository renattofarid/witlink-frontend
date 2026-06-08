import { z } from "zod";

export const serieSchema = z
  .object({
    producto_id: z.string().min(1, "Requerido"),
    serie: z.string().optional().nullable(),
    mac: z.string().optional().nullable(),
    emta_mac: z.string().optional().nullable(),
    ua: z.string().optional().nullable(),
    necesita_serie: z.boolean().optional().nullable(),
    necesita_mac: z.boolean().optional().nullable(),
    necesita_emta_mac: z.boolean().optional().nullable(),
    necesita_ua: z.boolean().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.necesita_serie && !data.serie) {
      ctx.addIssue({ code: "custom", message: "Requerido", path: ["serie"] });
    }
    if (data.necesita_mac && !data.mac) {
      ctx.addIssue({ code: "custom", message: "Requerido", path: ["mac"] });
    }
    if (data.necesita_emta_mac && !data.emta_mac) {
      ctx.addIssue({ code: "custom", message: "Requerido", path: ["emta_mac"] });
    }
    if (data.necesita_ua && !data.ua) {
      ctx.addIssue({ code: "custom", message: "Requerido", path: ["ua"] });
    }
  });

export type SerieFormValues = z.infer<typeof serieSchema>;
