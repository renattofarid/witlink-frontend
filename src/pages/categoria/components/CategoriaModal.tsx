import { GeneralModal } from "@/components/GeneralModal";
import CategoriaForm from "./CategoriaForm";
import type { CategoriaResource } from "../lib/categoria.interface";

interface CategoriaModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: CategoriaResource | null;
}

export default function CategoriaModal({
  open,
  onClose,
  mode,
  selected,
}: CategoriaModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Categoría" : "Editar Categoría"}
      icon="Boxes"
      mode={mode}
      size="md"
    >
      <CategoriaForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
