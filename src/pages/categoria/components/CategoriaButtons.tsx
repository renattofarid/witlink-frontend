import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoriaButtonsProps {
  onAdd: () => void;
}

export default function CategoriaButtons({ onAdd }: CategoriaButtonsProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
