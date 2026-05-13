import type { UseFormReturn } from "react-hook-form";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
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
          label="Buscar serie"
          control={serieSubForm.control}
          placeholder="Ingrese número de serie o MAC..."
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
              onSubmit();
            }
          }}
        />

        <FormInput
          name="observaciones"
          label="Observaciones"
          control={serieSubForm.control}
          placeholder="Notas sobre esta serie..."
          uppercase
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              serieSubForm.reset(EMPTY_SERIE);
              onClose();
            }}
          >
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
