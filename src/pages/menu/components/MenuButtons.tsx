import { Button } from "@/components/ui/button";
import { Plus, Columns3 } from "lucide-react";

interface MenuButtonsProps {
  onAdd: () => void;
  onReorganize: () => void;
}

export default function MenuButtons({ onAdd, onReorganize }: MenuButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onReorganize}>
        <Columns3 className="size-4 mr-1" />
        Reorganizar
      </Button>
      <Button onClick={onAdd}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>
    </div>
  );
}
