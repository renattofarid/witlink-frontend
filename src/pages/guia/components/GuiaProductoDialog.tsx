import { useEffect } from "react";
import { useWatch, Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductoQuery, useCategoriasAsyncQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import { useCategoriasQueryById } from "../lib/guia.hook";
import ProductoForm from "@/pages/producto/components/ProductoForm";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";

const EMPTY_SERIE: SerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  emta_mac: "",
  ua: "",
  observaciones: null,
};

// Formatea un valor crudo a MAC: "001A2B3C4D5E" → "00:1A:2B:3C:4D:5E"
function formatMac(value: string): string {
  const clean = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  const chunks = clean.match(/.{1,2}/g) ?? [];
  return chunks.join(":").substring(0, 17);
}

const CELL_INPUT =
  "h-7 w-full rounded-md border border-input bg-transparent px-2 py-0.5 text-xs shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring uppercase";

interface GuiaProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  tab: "catalogo" | "manual";
  productSubForm: UseFormReturn<ProductoFormValues>;
  watchedSeries: SerieFormValues[];
  onClose: () => void;
  onSubmit: () => void;
  onTabChange: (tab: "catalogo" | "manual") => void;
  onAppendSerie: (serie: SerieFormValues) => void;
  onRemoveSerie: (index: number) => void;
}

export function GuiaProductoDialog({
  open,
  editingIndex,
  tab,
  productSubForm,
  watchedSeries,
  onClose,
  onSubmit,
  onTabChange,
  onAppendSerie,
  onRemoveSerie,
}: GuiaProductoDialogProps) {
  const watchedTipo = useWatch({ control: productSubForm.control, name: "tipo" });
  const necesitaSerie = useWatch({ control: productSubForm.control, name: "necesita_serie" });
  const necesitaMac = useWatch({ control: productSubForm.control, name: "necesita_mac" });
  const necesitaEmtaMac = useWatch({ control: productSubForm.control, name: "necesita_emta_mac" });
  const necesitaUa = useWatch({ control: productSubForm.control, name: "necesita_ua" });
  const watchedCantidad = useWatch({ control: productSubForm.control, name: "cantidad" });

  const isEquipo = watchedTipo === "equipo";

  // null se trata igual que false → deshabilitado
  const disabledSerie = necesitaSerie !== true;
  const disabledMac = necesitaMac !== true;
  const disabledEmtaMac = necesitaEmtaMac !== true;
  const disabledUa = necesitaUa !== true;

  // Mostrar sección de series solo si al menos un flag es true
  const needsSeries = !!necesitaSerie || !!necesitaMac || !!necesitaEmtaMac || !!necesitaUa;

  // Auto-sincronizar filas de series con la cantidad ingresada
  useEffect(() => {
    if (!isEquipo || !needsSeries) return;
    const target = Number(watchedCantidad) || 0;
    const current = productSubForm.getValues("series")?.length ?? 0;
    if (current < target) {
      for (let i = current; i < target; i++) {
        onAppendSerie({ ...EMPTY_SERIE });
      }
    } else if (current > target) {
      for (let i = current - 1; i >= target; i--) {
        onRemoveSerie(i);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCantidad, isEquipo, needsSeries]);

  if (!open) return null;

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
      {/* Cabecera + tabs en una sola fila */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-muted-foreground">
            {editingIndex !== null ? `Producto #${editingIndex + 1}` : "Nuevo producto"}
          </p>
          <div className="flex gap-1">
            {(["catalogo", "manual"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  if (tab === t) return;
                  if (t === "catalogo") {
                    productSubForm.setValue("categoria_id", null);
                    productSubForm.setValue("sap", null);
                    productSubForm.setValue("nombre", null);
                    productSubForm.setValue("tipo", null);
                    productSubForm.setValue("origen", null);
                  } else {
                    productSubForm.setValue("producto_id", null);
                    productSubForm.setValue("tipo", null);
                  }
                  productSubForm.setValue("necesita_serie", null);
                  productSubForm.setValue("necesita_mac", null);
                  productSubForm.setValue("necesita_emta_mac", null);
                  productSubForm.setValue("necesita_ua", null);
                  onTabChange(t);
                }}
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {t === "catalogo" ? "Catálogo" : "Nuevo"}
              </button>
            ))}
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <X className="size-3" />
        </Button>
      </div>

      {/* Fila principal: selector/categoría + cantidad + observaciones */}
      <div className="grid grid-cols-4 gap-2 items-start">
        <div className="col-span-2">
          {tab === "catalogo" ? (
            <FormSelectAsync
              key="select-producto"
              name="producto_id"
              label="Producto"
              control={productSubForm.control}
              placeholder="Buscar por nombre o SAP..."
              useQueryHook={useProductoQuery}
              mapOptionFn={(item) => ({
                value: String(item.id),
                label: item.nombre,
                description: item.sap,
              })}
              onValueChange={(_, item: ProductoResource) => {
                if (item) {
                  productSubForm.setValue("categoria_id", null);
                  productSubForm.setValue("sap", null);
                  productSubForm.setValue("nombre", null);
                  productSubForm.setValue("tipo", (item.tipo as "material" | "equipo") ?? null);
                  productSubForm.setValue("necesita_serie", item.necesita_serie ?? null);
                  productSubForm.setValue("necesita_mac", item.necesita_mac ?? null);
                  productSubForm.setValue("necesita_emta_mac", item.necesita_emta_mac ?? null);
                  productSubForm.setValue("necesita_ua", item.necesita_ua ?? null);
                }
              }}
            />
          ) : (
            <FormSelectAsync
              key="select-categoria"
              name="categoria_id"
              label="Categoría"
              control={productSubForm.control}
              placeholder="Seleccione una categoría"
              required
              useQueryHook={useCategoriasAsyncQuery}
              useQueryByIdHook={useCategoriasQueryById}
              mapOptionFn={(item) => ({
                value: String(item.id),
                label: item.nombre,
              })}
            />
          )}
        </div>
        <FormInput
          name="cantidad"
          label="Cant."
          control={productSubForm.control}
          type="number"
          placeholder="1"
          required
        />
        <FormInput
          name="observaciones"
          label="Observaciones"
          control={productSubForm.control}
          placeholder="Notas internas..."
          uppercase
        />
      </div>

      {/* Campos adicionales en tab manual (SAP, Nombre, Tipo, Origen, Switches) a ancho completo */}
      {tab === "manual" && (
        <ProductoForm
          externalControl={productSubForm.control}
          skipCategoria
        />
      )}

      {/* Indicador de flags del producto */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Requiere:</span>
        {(
          [
            { label: "Serie", value: necesitaSerie },
            { label: "MAC", value: necesitaMac },
            { label: "EMTA MAC", value: necesitaEmtaMac },
            { label: "UA", value: necesitaUa },
          ] as const
        ).map(({ label, value }) => (
          <span
            key={label}
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
              value === true
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
                : "bg-muted border-border text-muted-foreground line-through"
            )}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Series — inline, solo para equipos con al menos un flag activo */}
      {isEquipo && needsSeries && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
              Series · {watchedSeries.length}/{Number(watchedCantidad) || 0}
            </p>
            <Separator className="flex-1" />
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="py-1 px-2 text-left font-medium text-muted-foreground w-6">#</th>
                    <th className={cn("py-1 px-1 text-left font-medium min-w-28", disabledSerie ? "text-muted-foreground/40" : "text-muted-foreground")}>Serie</th>
                    <th className={cn("py-1 px-1 text-left font-medium min-w-36", disabledMac ? "text-muted-foreground/40" : "text-muted-foreground")}>MAC</th>
                    <th className={cn("py-1 px-1 text-left font-medium min-w-36", disabledEmtaMac ? "text-muted-foreground/40" : "text-muted-foreground")}>EMTA MAC</th>
                    <th className={cn("py-1 px-1 text-left font-medium min-w-28", disabledUa ? "text-muted-foreground/40" : "text-muted-foreground")}>UA</th>
                  </tr>
                </thead>
                <tbody>
                  {watchedSeries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-2 py-2 text-center text-muted-foreground text-[11px]">
                        Ingrese la cantidad para generar las filas de series.
                      </td>
                    </tr>
                  )}
                  {watchedSeries.map((s, index) => {
                    const isExisting = !!s.serie_id;
                    const rowErrors = (productSubForm.formState.errors.series as any)?.[index];
                    return (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-2 py-1 text-muted-foreground">{index + 1}</td>

                        <td className="px-1 py-0.5">
                          {isExisting ? (
                            <span className={cn("font-mono px-1", disabledSerie && "opacity-40")}>{s.serie || "—"}</span>
                          ) : (
                            <div>
                              <input
                                {...productSubForm.register(`series.${index}.serie` as any)}
                                disabled={disabledSerie}
                                className={cn(CELL_INPUT, rowErrors?.serie && "border-destructive", disabledSerie && "opacity-40 cursor-not-allowed")}
                                placeholder="SN123456"
                                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
                              />
                              {rowErrors?.serie && <p className="text-[10px] text-destructive mt-0.5">{rowErrors.serie.message}</p>}
                            </div>
                          )}
                        </td>

                        <td className="px-1 py-0.5">
                          {isExisting ? (
                            <span className={cn("font-mono px-1", disabledMac && "opacity-40")}>{s.mac || "—"}</span>
                          ) : (
                            <Controller
                              control={productSubForm.control}
                              name={`series.${index}.mac` as any}
                              render={({ field, fieldState }) => (
                                <div>
                                  <input
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(formatMac(e.target.value))}
                                    onBlur={field.onBlur}
                                    disabled={disabledMac}
                                    className={cn(CELL_INPUT, "font-mono", fieldState.error && "border-destructive", disabledMac && "opacity-40 cursor-not-allowed")}
                                    placeholder="00:1A:2B:3C:4D:5E"
                                    maxLength={17}
                                  />
                                  {fieldState.error && <p className="text-[10px] text-destructive mt-0.5">{fieldState.error.message}</p>}
                                </div>
                              )}
                            />
                          )}
                        </td>

                        <td className="px-1 py-0.5">
                          {isExisting ? (
                            <span className={cn("font-mono px-1", disabledEmtaMac && "opacity-40")}>{s.emta_mac || "—"}</span>
                          ) : (
                            <Controller
                              control={productSubForm.control}
                              name={`series.${index}.emta_mac` as any}
                              render={({ field, fieldState }) => (
                                <div>
                                  <input
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(formatMac(e.target.value))}
                                    onBlur={field.onBlur}
                                    disabled={disabledEmtaMac}
                                    className={cn(CELL_INPUT, "font-mono", fieldState.error && "border-destructive", disabledEmtaMac && "opacity-40 cursor-not-allowed")}
                                    placeholder="00:1A:2B:3C:4D:5E"
                                    maxLength={17}
                                  />
                                  {fieldState.error && <p className="text-[10px] text-destructive mt-0.5">{fieldState.error.message}</p>}
                                </div>
                              )}
                            />
                          )}
                        </td>

                        <td className="px-1 py-0.5">
                          {isExisting ? (
                            <span className={cn("font-mono px-1", disabledUa && "opacity-40")}>{s.ua || "—"}</span>
                          ) : (
                            <div>
                              <input
                                {...productSubForm.register(`series.${index}.ua` as any)}
                                disabled={disabledUa}
                                className={cn(CELL_INPUT, "font-mono", rowErrors?.ua && "border-destructive", disabledUa && "opacity-40 cursor-not-allowed")}
                                placeholder="XX:XX:XX:XX:XX:XX"
                                maxLength={17}
                                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase(); }}
                              />
                              {rowErrors?.ua && <p className="text-[10px] text-destructive mt-0.5">{rowErrors.ua.message}</p>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {productSubForm.formState.errors.series?.message && (
            <p className="text-xs text-destructive">
              {productSubForm.formState.errors.series.message as string}
            </p>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X className="size-3 mr-1" />
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={onSubmit}>
          <Check className="size-3 mr-1" />
          {editingIndex !== null ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </div>
  );
}
