import { GeneralModal } from "@/components/GeneralModal";
import TipoUsuarioForm from "./TipoUsuarioForm";
import type { TipoUsuarioResource } from "../lib/tipo-usuario.interface";

interface TipoUsuarioModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: TipoUsuarioResource | null;
}

export default function TipoUsuarioModal({
  open,
  onClose,
  mode,
  selected,
}: TipoUsuarioModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Tipo de Usuario" : "Editar Tipo de Usuario"}
      icon="PersonStanding"
      mode={mode}
      size="md"
    >
      <TipoUsuarioForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
