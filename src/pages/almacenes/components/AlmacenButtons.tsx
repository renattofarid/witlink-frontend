import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AlmacenButtonsProps {
  onAdd: () => void;
}

export default function AlmacenButtons({ onAdd }: AlmacenButtonsProps) {
  return (
    <Button onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
