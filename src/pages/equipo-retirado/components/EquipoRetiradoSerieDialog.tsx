import type { UseFormReturn } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { FormInput } from "@/components/FormInput";
import { X, Check } from "lucide-react";
import { useSeriesERQuery } from "../lib/equipo-retirado.hook";
import type { ErSerieFormValues } from "../lib/equipo-retirado.schema";

const EMPTY_SERIE: ErSerieFormValues = {
  serie_id: null,
  serie: "",
  mac: "",
  emta_mac: null,
  ua: null,
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
      size="md"
    >
      <div className="space-y-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
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
                  serieSubForm.setValue("emta_mac", item.emta_mac ?? null);
                  serieSubForm.setValue("ua", item.ua ?? null);
                  if (!isEditing) onSubmit();
                }
              }}
            />
          </div>
          <div className="w-36">
            <FormInput
              name="observaciones"
              label="Observaciones"
              control={serieSubForm.control}
              placeholder="Opcional"
            />
          </div>
        </div>

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
