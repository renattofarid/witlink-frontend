import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check, Plus, Trash2 } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
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
  onUpdateSerie: (index: number, value: string) => void;
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
  onUpdateSerie,
}: DespachoProductoDialogProps) {
  const watchedCantidad = useWatch({
    control: productSubForm.control,
    name: "cantidad",
  });

  // Auto-sincronizar filas de series con la cantidad ingresada
  useEffect(() => {
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
  }, [watchedCantidad]);

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
            description: item.sap,
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => onAppendSerie({ serie: "" })}
          >
            <Plus className="size-3 mr-1" />
            Agregar serie
          </Button>
        </div>

        {watchedSeries.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {watchedSeries.map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {index + 1}.
                </span>
                <input
                  className="flex-1 h-7 rounded-md border border-input bg-background px-2 py-0.5 text-xs shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                  placeholder="Ej. ABC123456"
                  value={watchedSeries[index]?.serie ?? ""}
                  onChange={(e) => onUpdateSerie(index, e.target.value)}
                />
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
