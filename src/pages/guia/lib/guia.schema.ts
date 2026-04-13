import { z } from "zod";

export const serieSchema = z
  .object({
    serie_id: z.union([z.string(), z.number()]).optional().nullable(),
    serie: z.string().optional().nullable(),
    mac: z.string().optional().nullable(),
    emta_mac: z.string().optional().nullable(),
    ua: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.serie_id) return; // reingreso: skip format validation
    const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
    if (data.mac && !macRegex.test(data.mac)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato inválido (ej. 00:1A:2B:3C:4D:5E)",
        path: ["mac"],
      });
    }
    if (data.emta_mac && !macRegex.test(data.emta_mac)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato inválido (ej. 00:1A:2B:3C:4D:5E)",
        path: ["emta_mac"],
      });
    }
    if (data.ua && data.ua.length !== 17) {
      ctx.addIssue({
        code: "custom",
        message: "Debe tener 17 caracteres",
        path: ["ua"],
      });
    }
  });

export const productoSchema = z
  .object({
    productos_guia_id: z.number().optional().nullable(),
    producto_id: z.string().optional().nullable(),
    categoria_id: z.string().optional().nullable(),
    sap: z.string().optional().nullable(),
    nombre: z.string().optional().nullable(),
    tipo: z.enum(["MATERIAL", "EQUIPO"]).optional().nullable(),
    origen: z.string().optional().nullable(),
    necesita_serie: z.boolean().nullable().optional(),
    necesita_mac: z.boolean().nullable().optional(),
    necesita_emta_mac: z.boolean().nullable().optional(),
    necesita_ua: z.boolean().nullable().optional(),
    cantidad: z.coerce.number().min(1, "Minimo 1 unidad"),
    observaciones: z.string().optional().nullable(),
    series: z.array(serieSchema).optional().nullable(),
  })
  .superRefine((p, ctx) => {
    // Equipo manual: al menos un flag debe estar activo
    if (
      !p.producto_id &&
      p.tipo === "EQUIPO" &&
      !p.necesita_serie &&
      !p.necesita_mac &&
      !p.necesita_emta_mac &&
      !p.necesita_ua
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Un equipo debe requerir al menos una serie, MAC, EMTA MAC o UA.",
        path: ["necesita_serie"],
      });
    }
    // Producto manual: requiere al menos nombre o SAP
    if (!p.producto_id && !p.nombre && !p.sap) {
      ctx.addIssue({
        code: "custom",
        message: "Ingrese el nombre o código SAP del producto.",
        path: ["nombre"],
      });
    }
    // Series requeridas solo para equipos con necesita_serie = true
    if (p.tipo !== "EQUIPO" || !p.necesita_serie) return;
    if ((p.series?.length ?? 0) !== p.cantidad) {
      ctx.addIssue({
        code: "custom",
        message: `Este producto es un equipo y debe tener ${p.cantidad} serie(s) asociada(s).`,
        path: ["series"],
      });
    }
    // Validar unicidad de series — marca cada campo duplicado individualmente
    if (p.series && p.series.length > 1) {
      const markDuplicates = (
        values: (string | null | undefined)[],
        field: string
      ) => {
        const seen = new Map<string, number[]>();
        values.forEach((v, i) => {
          if (v) {
            const key = v.toUpperCase();
            if (!seen.has(key)) seen.set(key, []);
            seen.get(key)!.push(i);
          }
        });
        seen.forEach((indices) => {
          if (indices.length > 1) {
            indices.forEach((i) => {
              ctx.addIssue({
                code: "custom",
                message: "Duplicado",
                path: ["series", i, field],
              });
            });
          }
        });
      };
      markDuplicates(p.series.map((s) => s.serie), "serie");
      markDuplicates(p.series.map((s) => s.mac), "mac");
      markDuplicates(p.series.map((s) => s.emta_mac), "emta_mac");
      markDuplicates(p.series.map((s) => s.ua), "ua");
    }
  });

export const guiaCreateSchema = z.object({
  numero: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  // proveedor_id: z.string().min(1, "Requerido"),
  productos: z
    .array(productoSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export const guiaEditSchema = guiaCreateSchema;

export type SerieFormValues = z.infer<typeof serieSchema>;
export type ProductoFormValues = z.infer<typeof productoSchema>;
export type GuiaCreateFormValues = z.infer<typeof guiaCreateSchema>;
export type GuiaEditFormValues = GuiaCreateFormValues;
