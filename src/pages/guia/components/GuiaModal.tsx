import { GeneralModal } from "@/components/GeneralModal";
import GuiaForm from "./GuiaForm";
import type { GuiaResource } from "../lib/guia.interface";

interface GuiaModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: GuiaResource | null;
}

export default function GuiaModal({ open, onClose, mode, selected }: GuiaModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Guia" : "Editar Guia"}
      icon="ClipboardList"
      mode={mode}
      size="md"
    >
      <GuiaForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
