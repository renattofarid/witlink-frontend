import type { UseFormReturn } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
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
  onClose: () => void;
  onSubmit: () => void;
}

export function EquiposRetiradosSerieDialog({
  open,
  editingIndex,
  serieSubForm,
  onClose,
  onSubmit,
}: EquiposRetiradosSerieDialogProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={
        editingIndex !== null
          ? `Editando serie #${editingIndex + 1}`
          : "Agregar serie"
      }
      size="md"
    >
      <div className="space-y-4">
        <FormSelectAsync
          name="serie_id"
          label="Serie"
          control={serieSubForm.control}
          placeholder="Buscar por número de serie..."
          useQueryHook={useSeriesDisponiblesQuery}
          legacyPagination={false}
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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="size-3 mr-1" />
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit}>
            <Check className="size-3 mr-1" />
            {editingIndex !== null ? "Actualizar" : "Agregar"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
