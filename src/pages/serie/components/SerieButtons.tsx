import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SerieButtonsProps {
  onAdd: () => void;
}

export default function SerieButtons({ onAdd }: SerieButtonsProps) {
  return (
    <Button onClick={onAdd}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
