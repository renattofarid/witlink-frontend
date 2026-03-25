import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { GeneralModal } from "@/components/GeneralModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelect } from "@/components/FormSelect";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { DataTable } from "@/components/DataTable";
import { X, Check } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import { useCategoriasQuery, useCategoriasQueryById } from "../lib/guia.hook";
import type { ProductoFormValues, SerieFormValues } from "../lib/guia.schema";

const TIPO_OPTIONS = [
  { value: "material", label: "Material" },
  { value: "equipo", label: "Equipo" },
];

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
        <Tabs
          value={tab}
          onValueChange={(v) => {
            const next = v as "catalogo" | "manual";
            if (next === "catalogo") {
              productSubForm.setValue("categoria_id", null);
              productSubForm.setValue("sap", null);
              productSubForm.setValue("nombre", null);
              productSubForm.setValue("tipo", null);
            } else {
              productSubForm.setValue("producto_id", null);
              productSubForm.setValue("tipo", null);
            }
            onTabChange(next);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalogo">Del catálogo</TabsTrigger>
            <TabsTrigger value="manual">Ingreso manual</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogo" className="space-y-3 pt-2">
            <FormSelectAsync
              name="producto_id"
              label="Producto"
              control={productSubForm.control}
              placeholder="Buscar por nombre o SAP..."
              useQueryHook={useProductoQuery}
              additionalParams={{ tipo: "equipo" }}
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
                  // Guardar tipo para validar series (equipo requiere series)
                  productSubForm.setValue(
                    "tipo",
                    (item.tipo as "material" | "equipo") ?? null,
                  );
                }
              }}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormSelectAsync
                name="categoria_id"
                label="Categoría"
                control={productSubForm.control}
                placeholder="Seleccione una categoría"
                useQueryHook={useCategoriasQuery}
                useQueryByIdHook={useCategoriasQueryById}
                mapOptionFn={(item) => ({
                  value: String(item.id),
                  label: item.nombre,
                })}
              />
              <FormSelect
                name="tipo"
                label="Tipo"
                control={productSubForm.control}
                placeholder="Seleccione un tipo"
                options={TIPO_OPTIONS}
              />
              <FormInput
                name="sap"
                label="Código SAP"
                control={productSubForm.control}
                placeholder="Ej. 100001"
                uppercase
              />
              <FormInput
                name="nombre"
                label="Nombre del producto"
                control={productSubForm.control}
                placeholder="Descripción del producto"
                uppercase
              />
            </div>
          </TabsContent>
        </Tabs>

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

        {/* Series */}
        <div className="space-y-3">
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
