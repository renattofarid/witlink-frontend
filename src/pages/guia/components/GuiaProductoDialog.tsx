import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DataTable } from "@/components/DataTable";
import { X, Check } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import { useCategoriasQueryById } from "../lib/guia.hook";
import ProductoForm from "@/pages/producto/components/ProductoForm";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";

interface GuiaProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  tab: "catalogo" | "manual";
  productSubForm: UseFormReturn<ProductoFormValues>;
  watchedSeries: SerieFormValues[];
  serieColumns: ColumnDef<SerieFormValues>[];
  onClose: () => void;
  onSubmit: () => void;
  onTabChange: (tab: "catalogo" | "manual") => void;
  onOpenSerieDialog: (tab: "select" | "create") => void;
}

export function GuiaProductoDialog({
  open,
  editingIndex,
  tab,
  productSubForm,
  watchedSeries,
  serieColumns,
  onClose,
  onSubmit,
  onTabChange,
  onOpenSerieDialog,
}: GuiaProductoDialogProps) {
  const watchedTipo = useWatch({ control: productSubForm.control, name: "tipo" });
  const isEquipo = watchedTipo === "equipo";

  if (!open) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {editingIndex !== null
            ? `Editando producto #${editingIndex + 1}`
            : "Agregar producto"}
        </p>
        <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onClose}>
          <X className="size-3" />
        </Button>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={tab === "catalogo" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (tab === "catalogo") return;
            productSubForm.setValue("categoria_id", null);
            productSubForm.setValue("sap", null);
            productSubForm.setValue("nombre", null);
            productSubForm.setValue("tipo", null);
            productSubForm.setValue("origen", null);
            productSubForm.setValue("necesita_serie", null);
            productSubForm.setValue("necesita_mac", null);
            productSubForm.setValue("necesita_emta_mac", null);
            productSubForm.setValue("necesita_ua", null);
            onTabChange("catalogo");
          }}
        >
          Catálogo
        </Button>
        <Button
          type="button"
          variant={tab === "manual" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (tab === "manual") return;
            productSubForm.setValue("producto_id", null);
            productSubForm.setValue("tipo", null);
            productSubForm.setValue("necesita_serie", null);
            productSubForm.setValue("necesita_mac", null);
            productSubForm.setValue("necesita_emta_mac", null);
            productSubForm.setValue("necesita_ua", null);
            onTabChange("manual");
          }}
        >
          Nuevo
        </Button>
      </div>

      {tab === "catalogo" && (
        <div className="space-y-3">
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
        </div>
      )}

      {tab === "manual" && (
        <div className="space-y-3">
          <ProductoForm
            externalControl={productSubForm.control}
            categoriaQueryByIdHook={useCategoriasQueryById}
          />
        </div>
      )}

      {/* Campos compartidos */}
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          name="cantidad"
          label="Cantidad"
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

      {/* Series — solo visibles si el producto es un equipo */}
      {isEquipo && (
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
              onClick={() => onOpenSerieDialog("select")}
            >
              + Agregar serie
            </Button>
          </div>

          {watchedSeries.length > 0 && (
            <DataTable
              columns={serieColumns}
              data={watchedSeries as SerieFormValues[]}
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
