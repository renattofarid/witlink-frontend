import { useRef } from "react";
import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { DataTable } from "@/components/DataTable";
import { X, Check } from "lucide-react";
import { useProductoQuery } from "@/pages/producto/lib/producto.hook";
import { useSeriesERQuery } from "../lib/equipo-retirado.hook";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";
import type { ErProductoFormValues, ErSerieFormValues } from "../lib/equipo-retirado.schema";

const EMPTY_SERIE: ErSerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  emta_mac: null,
  ua: null,
  observaciones: null,
};

interface EquipoRetiradoProductoDialogProps {
  open: boolean;
  editingIndex: number | null;
  productSubForm: UseFormReturn<ErProductoFormValues>;
  serieSubForm: UseFormReturn<ErSerieFormValues>;
  watchedSeries: ErSerieFormValues[];
  serieColumns: ColumnDef<ErSerieFormValues>[];
  onClose: () => void;
  onSubmit: () => void;
  onAddSerie: (serie: ErSerieFormValues) => void;
}

export function EquipoRetiradoProductoDialog({
  open,
  editingIndex,
  productSubForm,
  serieSubForm,
  watchedSeries,
  serieColumns,
  onClose,
  onSubmit,
  onAddSerie,
}: EquipoRetiradoProductoDialogProps) {
  const serieSelectRef = useRef<HTMLDivElement>(null);

  const watchedTipo = useWatch({
    control: productSubForm.control,
    name: "tipo",
  });
  const isEquipo = watchedTipo === "EQUIPO";

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
            productSubForm.setValue("tipo", (item.tipo as "MATERIAL" | "EQUIPO") ?? null);
            productSubForm.setValue("origen", item.origen ?? null);
            productSubForm.setValue("necesita_serie", item.necesita_serie ?? null);
            productSubForm.setValue("necesita_mac", item.necesita_mac ?? null);
            productSubForm.setValue("necesita_emta_mac", item.necesita_emta_mac ?? null);
            productSubForm.setValue("necesita_ua", item.necesita_ua ?? null);
            productSubForm.setValue("series", []);
          }
        }}
      />

      {/* Series — inline search, solo para EQUIPO */}
      {isEquipo && (
        <div className="space-y-2">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Series {watchedSeries.length > 0 && `(${watchedSeries.length})`}
          </p>

          <div className="flex gap-2 items-end">
            <div className="flex-1" ref={serieSelectRef}>
              <FormSelectAsync
                name="serie_id"
                control={serieSubForm.control}
                placeholder="Buscar por número de serie o MAC..."
                useQueryHook={useSeriesERQuery}
                legacyPagination={false}
                mapOptionFn={(item) => ({
                  value: String(item.id),
                  label: item.serie,
                  description: item.mac,
                })}
                onValueChange={(_, item) => {
                  if (item) {
                    onAddSerie({
                      serie_id: String(item.id),
                      serie: item.serie,
                      mac: item.mac ?? null,
                      emta_mac: item.emta_mac ?? null,
                      ua: item.ua ?? null,
                      observaciones: serieSubForm.getValues("observaciones"),
                    });
                    serieSubForm.reset(EMPTY_SERIE);
                    setTimeout(() => {
                      serieSelectRef.current?.querySelector("button")?.focus();
                    }, 50);
                  }
                }}
              />
            </div>
            <div className="w-36">
              <FormInput
                name="observaciones"
                control={serieSubForm.control}
                placeholder="Observaciones"
              />
            </div>
          </div>

          {watchedSeries.length > 0 && (
            <DataTable
              columns={serieColumns}
              data={watchedSeries}
              variant="outline"
              isVisibleColumnFilter={false}
            />
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
