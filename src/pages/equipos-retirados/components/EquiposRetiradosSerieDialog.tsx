import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check } from "lucide-react";
import { useSeriesDisponiblesQuery } from "../lib/equipos-retirados.hook";
import type { SerieRetiradaFormValues } from "../lib/equipos-retirados.schema";

interface EquiposRetiradosSerieDialogProps {
  open: boolean;
  editingIndex: number | null;
  serieSubForm: UseFormReturn<SerieRetiradaFormValues>;
  productoId?: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function EquiposRetiradosSerieDialog({
  open,
  editingIndex,
  serieSubForm,
  productoId,
  onClose,
  onSubmit,
}: EquiposRetiradosSerieDialogProps) {
  if (!open) return null;

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {editingIndex !== null
            ? `Editando serie #${editingIndex + 1}`
            : "Agregar serie"}
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

      <FormSelectAsync
        name="serie_id"
        label="Serie"
        control={serieSubForm.control}
        placeholder="Buscar por número de serie..."
        useQueryHook={useSeriesDisponiblesQuery}
        legacyPagination={false}
        additionalParams={productoId ? { producto_id: Number(productoId) } : {}}
        mapOptionFn={(item) => ({
          value: String(item.id),
          label: item.serie,
          description: item.mac ?? undefined,
        })}
        onValueChange={(_, item) => {
          if (item) {
            serieSubForm.setValue("serie", item.serie ?? null);
            serieSubForm.setValue("mac", item.mac ?? null);
          }
        }}
        required
      />
      <FormInput
        name="observaciones"
        label="Observaciones"
        control={serieSubForm.control}
        placeholder="Notas sobre esta serie..."
        uppercase
      />

      <div className="flex justify-end gap-2">
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
