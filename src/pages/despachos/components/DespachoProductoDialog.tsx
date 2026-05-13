import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check, Trash2 } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import type { SerieResource } from "@/pages/serie/lib/serie.interface";
import { useSeriesDisponiblesDespachoQuery } from "../lib/despacho.hook";
import type {
  DespachoProductoFormValues,
  DespachoSerieFormValues,
} from "../lib/despacho.schema";

interface DespachoProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  productSubForm: UseFormReturn<DespachoProductoFormValues>;
  watchedSeries: DespachoSerieFormValues[];
  onClose: () => void;
  onSubmit: () => void;
  onAppendSerie: (serie: DespachoSerieFormValues) => void;
  onRemoveSerie: (index: number) => void;
}

export function DespachoProductoDialog({
  open,
  editingIndex,
  productSubForm,
  watchedSeries,
  onClose,
  onSubmit,
  onAppendSerie,
  onRemoveSerie,
}: DespachoProductoDialogProps) {
  const seriesContainerRef = useRef<HTMLDivElement>(null);
  const shouldFocusLastRef = useRef(false);

  const watchedCantidad = useWatch({
    control: productSubForm.control,
    name: "cantidad",
  });

  const watchedProductoId = useWatch({
    control: productSubForm.control,
    name: "producto_id",
  });

  // Auto-sincronizar filas de series con la cantidad ingresada
  useEffect(() => {
    if (!open) return;
    const target = Number(watchedCantidad) || 0;
    const current = productSubForm.getValues("series")?.length ?? 0;
    if (current < target) {
      for (let i = current; i < target; i++) {
        onAppendSerie({ serie: "" });
      }
    } else if (current > target) {
      for (let i = current - 1; i >= target; i--) {
        onRemoveSerie(i);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCantidad, open]);

  // Auto-focus the newly appended series row
  useEffect(() => {
    if (!shouldFocusLastRef.current || !seriesContainerRef.current) return;
    shouldFocusLastRef.current = false;
    const buttons = seriesContainerRef.current.querySelectorAll<HTMLButtonElement>('[role="combobox"]');
    buttons[buttons.length - 1]?.click();
  }, [watchedSeries.length]);

  if (!open) return null;

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {editingIndex !== null
            ? `Editando producto #${editingIndex + 1}`
            : "Agregar producto"}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
        >
          <X className="size-3" />
        </Button>
      </div>

      {/* Campos principales */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <FormSelectAsync
          name="producto_id"
          label="Producto"
          control={productSubForm.control}
          placeholder="Buscar por nombre o SAP..."
          useQueryHook={useProductoQuery}
          mapOptionFn={(item: ProductoResource) => ({
            value: String(item.id),
            label: item.nombre,
            description: item.sap + " | " + item.tipo,
          })}
          onValueChange={(_, item: ProductoResource) => {
            if (item) {
              productSubForm.setValue("nombre", item.nombre ?? null);
              productSubForm.setValue("sap", item.sap ?? null);
            }
          }}
          required
        />

        <FormInput
          name="cantidad"
          label="Cantidad"
          control={productSubForm.control}
          type="number"
          placeholder="1"
          required
        />
      </div>

      {/* Series */}
      <div className="space-y-2">
        <Separator />
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Series ({watchedSeries.length})
          </p>
        </div>

        {watchedProductoId && watchedSeries.length > 0 && (
          <div ref={seriesContainerRef} className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {watchedSeries.map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <FormSelectAsync
                    name={`series.${index}.serie_id` as any}
                    control={productSubForm.control}
                    placeholder="Buscar por número de serie..."
                    useQueryHook={useSeriesDisponiblesDespachoQuery}
                    legacyPagination={false}
                    additionalParams={
                      watchedProductoId
                        ? { producto_id: Number(watchedProductoId) }
                        : {}
                    }
                    mapOptionFn={(item: SerieResource) => ({
                      value: String(item.id),
                      label: item.serie ?? String(item.id),
                      description: item.mac ?? undefined,
                    })}
                    onValueChange={(_: any, item: SerieResource) => {
                      if (item) {
                        productSubForm.setValue(
                          `series.${index}.serie` as any,
                          item.serie ?? "",
                        );
                        if (index === watchedSeries.length - 1) {
                          shouldFocusLastRef.current = true;
                          productSubForm.setValue(
                            "cantidad",
                            Number(watchedCantidad) + 1,
                          );
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-destructive hover:text-destructive shrink-0"
                  onClick={() => onRemoveSerie(index)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {productSubForm.formState.errors.series?.message && (
          <p className="text-xs text-destructive">
            {productSubForm.formState.errors.series.message}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X className="size-3 mr-1" />
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={onSubmit}>
          <Check className="size-3 mr-1" />
          {editingIndex !== null ? "Actualizar producto" : "Agregar producto"}
        </Button>
      </div>
    </div>
  );
}
