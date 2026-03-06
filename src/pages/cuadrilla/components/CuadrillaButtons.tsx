import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CuadrillaButtonsProps {
  onAdd: () => void;
}

export default function CuadrillaButtons({ onAdd }: CuadrillaButtonsProps) {
  return (
    <Button size="sm" onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
