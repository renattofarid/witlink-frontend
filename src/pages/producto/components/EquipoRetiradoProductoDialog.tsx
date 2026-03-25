import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DataTable } from "@/components/DataTable";
import { X, Check } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import type {
  ErProductoFormValues,
  ErSerieFormValues,
} from "@/pages/equipo-retirado/lib/equipo-retirado.schema";

interface EquipoRetiradoProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  productSubForm: UseFormReturn<ErProductoFormValues>;
  watchedSeries: ErSerieFormValues[];
  serieColumns: ColumnDef<ErSerieFormValues>[];
  onClose: () => void;
  onSubmit: () => void;
  onOpenSerieDialog: () => void;
}

export function EquipoRetiradoProductoDialog({
  open,
  editingIndex,
  productSubForm,
  watchedSeries,
  serieColumns,
  onClose,
  onSubmit,
  onOpenSerieDialog,
}: EquipoRetiradoProductoDialogProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={
        editingIndex !== null
          ? `Editando producto #${editingIndex + 1}`
          : "Agregar producto"
      }
      size="2xl"
    >
      <div className="space-y-4">
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
              productSubForm.setValue("sap", item.sap ?? null);
              productSubForm.setValue(
                "tipo",
                (item.tipo as "material" | "equipo") ?? null,
              );
            }
          }}
        />

        <FormInput
          name="cantidad"
          label="Cantidad"
          control={productSubForm.control}
          type="number"
          placeholder="1"
          required
        />

        {/* Series */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Series
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onOpenSerieDialog}>
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
    </GeneralModal>
  );
}
