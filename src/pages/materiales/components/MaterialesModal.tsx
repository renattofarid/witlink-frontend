import { GeneralModal } from "@/components/GeneralModal";
import MaterialesForm from "./MaterialesForm";
import type { MaterialResource } from "../lib/materiales.interface";

interface MaterialesModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: MaterialResource | null;
}

export default function MaterialesModal({
  open,
  onClose,
  mode,
  selected,
}: MaterialesModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Material" : "Editar Material"}
      icon="List"
      size="md"
    >
      <MaterialesForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
