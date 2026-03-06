import { GeneralModal } from "@/components/GeneralModal";
import CuadrillaForm from "./CuadrillaForm";
import type { CuadrillaResource } from "../lib/cuadrilla.interface";

interface CuadrillaModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: CuadrillaResource | null;
}

export default function CuadrillaModal({
  open,
  onClose,
  mode,
  selected,
}: CuadrillaModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Cuadrilla" : "Editar Cuadrilla"}
      icon="CirclePile"
      mode={mode}
      size="md"
    >
      <CuadrillaForm
        key={selected?.id ?? "create"}
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
