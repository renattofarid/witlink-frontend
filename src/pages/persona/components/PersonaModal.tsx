import { GeneralModal } from "@/components/GeneralModal";
import PersonaForm from "./PersonaForm";
import type { PersonaResource } from "../lib/persona.interface";
import { SUBTITLE } from "@/lib/core.function";
import { PersonaComplete } from "../lib/persona.constants";

interface PersonaModalProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  selected?: PersonaResource | null;
}

export default function PersonaModal({
  open,
  onClose,
  mode,
  selected,
}: PersonaModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear Persona" : "Editar Persona"}
      subtitle={SUBTITLE(PersonaComplete.MODEL, mode)}
      icon="User2"
      size="lg"
    >
      <PersonaForm
        mode={mode}
        defaultValues={selected ?? undefined}
        onSuccess={onClose}
      />
    </GeneralModal>
  );
}
