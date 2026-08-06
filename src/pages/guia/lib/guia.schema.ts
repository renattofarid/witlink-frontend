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
    const macRegex = /^[0-9A-Fa-f]{12}$/;
    if (data.mac && !macRegex.test(data.mac)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato inválido (Caracteres hex, ej. 001A2B3C4D5E)",
        path: ["mac"],
      });
    }
  });

export const productoSchema = z
  .object({
    productos_guia_id: z.number().optional().nullable(),
    producto_id: z.string().min(1, "Seleccione un producto del catálogo"),
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
    // Solo aplica cuando el producto es nuevo (creado desde el botón "+"); no se envía si se selecciona uno existente.
    lote: z.string().max(100, "Máximo 100 caracteres").optional().nullable(),
  })
  .superRefine((p, ctx) => {
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
        field: string,
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
      markDuplicates(
        p.series.map((s) => s.serie),
        "serie",
      );
      markDuplicates(
        p.series.map((s) => s.mac),
        "mac",
      );
      markDuplicates(
        p.series.map((s) => s.emta_mac),
        "emta_mac",
      );
      markDuplicates(
        p.series.map((s) => s.ua),
        "ua",
      );
    }
  });

const guiaBaseFields = {
  numero: z.string().min(1, "Requerido"),
  fecha: z.string().min(1, "Requerido"),
  // Solo requerido para usuarios corporativos: el almacén de sesión puede ser
  // el almacén "padre" del grupo, que nunca es un almacén físico válido.
  almacen_id: z.union([z.string(), z.number()]).optional().nullable(),
  productos: z
    .array(productoSchema)
    .min(1, "Debe agregar al menos un producto"),
};

export const guiaCreateSchema = z.object({
  ...guiaBaseFields,
  archivo: z
    .any()
    .refine((v) => v instanceof File, { message: "El archivo es requerido" }),
});

export const guiaEditSchema = z.object({
  ...guiaBaseFields,
  archivo: z.any().optional().nullable(),
});

export type SerieFormValues = z.infer<typeof serieSchema>;
export type ProductoFormValues = z.infer<typeof productoSchema>;
export type GuiaCreateFormValues = z.infer<typeof guiaCreateSchema>;
export type GuiaEditFormValues = GuiaCreateFormValues;

const macRegexQuick = /^[0-9A-Fa-f]$/;

export const quickAddSerieSchema = z
  .object({
    serie: z.string().optional().nullable(),
    mac: z.string().optional().nullable(),
    emta_mac: z.string().optional().nullable(),
    ua: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.serie && !data.mac && !data.emta_mac && !data.ua) {
      ctx.addIssue({
        code: "custom",
        message: "Ingrese al menos un campo",
        path: ["serie"],
      });
    }
    if (data.mac && !macRegexQuick.test(data.mac)) {
      ctx.addIssue({
        code: "custom",
        message: "Formato inválido (Caracteres hex, ej. 001A2B3C4D5E)",
        path: ["mac"],
      });
    }
  });

export type QuickAddSerieFormValues = z.infer<typeof quickAddSerieSchema>;
