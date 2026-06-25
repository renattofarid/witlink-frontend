import { GeneralModal } from "@/components/GeneralModal";
import AlmacenForm from "./AlmacenForm";
import type { AlmacenResource } from "../lib/almacen.interface";

interface AlmacenModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: AlmacenResource | null;
}

export default function AlmacenModal({
  open,
  onClose,
  mode,
  selected,
}: AlmacenModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Almacén" : "Editar Almacén"}
      icon="Box"
      size="md"
    >
      <AlmacenForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
