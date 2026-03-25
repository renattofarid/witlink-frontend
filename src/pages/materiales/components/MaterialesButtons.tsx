import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MaterialesButtonsProps {
  onAdd: () => void;
}

export default function MaterialesButtons({ onAdd }: MaterialesButtonsProps) {
  return (
    <Button onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
