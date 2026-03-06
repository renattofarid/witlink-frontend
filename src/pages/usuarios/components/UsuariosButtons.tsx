import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UsuariosButtonsProps {
  onAdd: () => void;
}

export default function UsuariosButtons({ onAdd }: UsuariosButtonsProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
