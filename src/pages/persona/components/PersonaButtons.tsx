import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PersonaButtonsProps {
  onAdd: () => void;
}

export default function PersonaButtons({ onAdd }: PersonaButtonsProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
