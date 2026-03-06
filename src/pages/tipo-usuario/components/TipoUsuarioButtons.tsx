import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TipoUsuarioButtonsProps {
  onAdd: () => void;
}

export default function TipoUsuarioButtons({ onAdd }: TipoUsuarioButtonsProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
