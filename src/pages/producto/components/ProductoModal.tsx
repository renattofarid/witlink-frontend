import { GeneralModal } from "@/components/GeneralModal";
import ProductoForm from "./ProductoForm";
import type { ProductoResource } from "../lib/producto.interface";

interface ProductoModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: ProductoResource | null;
}

export default function ProductoModal({
  open,
  onClose,
  mode,
  selected,
}: ProductoModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Producto" : "Editar Producto"}
      icon="Box"
      mode={mode}
      size="md"
    >
      <ProductoForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
