import type { UseFormReturn } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { X, Check } from "lucide-react";
import { useSeriesERQuery } from "../lib/equipo-retirado.hook";
import type { ErSerieFormValues } from "../lib/equipo-retirado.schema";

const EMPTY_SERIE: ErSerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  observaciones: null,
};

interface EquipoRetiradoSerieDialogProps {
  open: boolean;
  editingIndex?: number | null;
  serieSubForm: UseFormReturn<ErSerieFormValues>;
  onClose: () => void;
  onSubmit: () => void;
}

export function EquipoRetiradoSerieDialog({
  open,
  editingIndex = null,
  serieSubForm,
  onClose,
  onSubmit,
}: EquipoRetiradoSerieDialogProps) {
  const isEditing = editingIndex !== null;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={isEditing ? `Editando serie #${editingIndex + 1}` : "Agregar serie"}
      size="sm"
    >
      <div className="space-y-3">
        <FormSelectAsync
          name="serie_id"
          label="Serie"
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
              serieSubForm.setValue("serie", item.serie);
              serieSubForm.setValue("mac", item.mac ?? null);
              if (!isEditing) onSubmit();
            }
          }}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              serieSubForm.reset(EMPTY_SERIE);
              onClose();
            }}
          >
            <X className="size-3 mr-1" />
            Cancelar
          </Button>
          {isEditing && (
            <Button type="button" size="sm" onClick={onSubmit}>
              <Check className="size-3 mr-1" />
              Actualizar
            </Button>
          )}
        </div>
      </div>
    </GeneralModal>
  );
}
