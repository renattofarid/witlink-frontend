import { Button } from "@/components/ui/button";
import { Plus, PackageMinus } from "lucide-react";

interface ProductoButtonsProps {
  onAdd: () => void;
  onRetiro: () => void;
}

export default function ProductoButtons({ onAdd, onRetiro }: ProductoButtonsProps) {
  return (
    <>
      <Button variant="outline" onClick={onRetiro}>
        <PackageMinus className="size-4 mr-1" />
        Registrar retiro
      </Button>
      <Button onClick={onAdd}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>
    </>
  );
}
