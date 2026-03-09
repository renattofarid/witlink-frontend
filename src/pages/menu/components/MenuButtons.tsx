import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MenuButtonsProps {
  onAdd: () => void;
}

export default function MenuButtons({ onAdd }: MenuButtonsProps) {
  return (
    <Button onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
