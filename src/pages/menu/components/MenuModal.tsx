import { GeneralModal } from "@/components/GeneralModal";
import MenuForm from "./MenuForm";
import type { MenuResource } from "../lib/menu.interface";

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: MenuResource | null;
}

export default function MenuModal({
  open,
  onClose,
  mode,
  selected,
}: MenuModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Menú" : "Editar Menú"}
      icon="List"
      mode={mode}
      size="md"
    >
      <MenuForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
