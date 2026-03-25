import { GeneralModal } from "@/components/GeneralModal";
import SerieForm from "./SerieForm";

interface SerieModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SerieModal({ open, onClose }: SerieModalProps) {
  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Crear Serie"
      icon="List"
      size="md"
    >
      <SerieForm onSuccess={onClose} />
    </GeneralModal>
  );
}
