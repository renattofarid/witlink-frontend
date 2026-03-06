import { GeneralModal } from "@/components/GeneralModal";
import OficinaForm from "./OficinaForm";
import type { OficinaResource } from "../lib/oficina.interface";

interface OficinaModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: OficinaResource | null;
}

export default function OficinaModal({
  open,
  onClose,
  mode,
  selected,
}: OficinaModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Oficina" : "Editar Oficina"}
      icon="Building"
      mode={mode}
      size="md"
    >
      <OficinaForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
