import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProductoButtonsProps {
  onAdd: () => void;
}

export default function ProductoButtons({ onAdd }: ProductoButtonsProps) {
  return (
    <Button onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
