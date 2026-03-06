import { GeneralModal } from "@/components/GeneralModal";
import TecnicoForm from "./TecnicoForm";
import type { TecnicoResource } from "../lib/tecnico.interface";

interface TecnicoModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: TecnicoResource | null;
}

export default function TecnicoModal({
  open,
  onClose,
  mode,
  selected,
}: TecnicoModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Técnico" : "Editar Técnico"}
      icon="User"
      mode={mode}
      size="md"
    >
      <TecnicoForm
        key={selected?.id ?? "create"}
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
