import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TecnicoButtonsProps {
  onAdd: () => void;
}

export default function TecnicoButtons({ onAdd }: TecnicoButtonsProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
