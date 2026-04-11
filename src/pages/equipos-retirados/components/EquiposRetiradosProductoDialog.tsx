import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DataTable } from "@/components/DataTable";
import { X, Check } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import type {
  ProductoRetiradoFormValues,
  SerieRetiradaFormValues,
} from "../lib/equipos-retirados.schema";

interface EquiposRetiradosProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  productSubForm: UseFormReturn<ProductoRetiradoFormValues>;
  watchedSeries: SerieRetiradaFormValues[];
  serieColumns: ColumnDef<SerieRetiradaFormValues>[];
  onClose: () => void;
  onSubmit: () => void;
  onOpenSerieDialog: () => void;
}

export function EquiposRetiradosProductoDialog({
  open,
  editingIndex,
  productSubForm,
  watchedSeries,
  serieColumns,
  onClose,
  onSubmit,
  onOpenSerieDialog,
}: EquiposRetiradosProductoDialogProps) {
  const necesitaSerie = useWatch({
    control: productSubForm.control,
    name: "necesita_serie",
  });

  if (!open) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
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

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <FormSelectAsync
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
              productSubForm.setValue("nombre", item.nombre ?? null);
              productSubForm.setValue("origen", item.origen ?? null);
              productSubForm.setValue(
                "necesita_serie",
                item.necesita_serie ?? null,
              );
              productSubForm.setValue(
                "necesita_mac",
                item.necesita_mac ?? null,
              );
              productSubForm.setValue(
                "necesita_emta_mac",
                item.necesita_emta_mac ?? null,
              );
              productSubForm.setValue("necesita_ua", item.necesita_ua ?? null);
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

      {necesitaSerie && (
        <div className="space-y-3">
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Series
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSerieDialog}
            >
              + Agregar serie
            </Button>
          </div>

          {watchedSeries.length > 0 && (
            <DataTable
              columns={serieColumns}
              data={watchedSeries}
              variant="outline"
              isVisibleColumnFilter={false}
            />
          )}

          {productSubForm.formState.errors.series?.message && (
            <p className="text-sm text-destructive">
              {productSubForm.formState.errors.series.message}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          <X className="size-3 mr-1" />
          Cancelar
        </Button>
        <Button type="button" onClick={onSubmit}>
          <Check className="size-3 mr-1" />
          {editingIndex !== null ? "Actualizar producto" : "Agregar producto"}
        </Button>
      </div>
    </div>
  );
}
