import { GeneralModal } from "@/components/GeneralModal";
import UsuariosForm from "./UsuariosForm";
import type { UsuariosResource } from "../lib/usuarios.interface";

interface UsuariosModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: UsuariosResource | null;
}

export default function UsuariosModal({
  open,
  onClose,
  mode,
  selected,
}: UsuariosModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Usuario" : "Editar Usuario"}
      icon="Users"
      mode={mode}
      size="md"
    >
      <UsuariosForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
