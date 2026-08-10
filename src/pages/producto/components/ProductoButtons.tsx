import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface ProductoButtonsProps {
  onAdd: () => void;
  onRetiro: () => void;
  onImportarSap: () => void;
}

export default function ProductoButtons({ onAdd, onImportarSap }: ProductoButtonsProps) {
  return (
    <>
      <Button variant="outline" onClick={onImportarSap}>
        <Upload className="size-4 mr-1" />
        Importar SAP
      </Button>
      <Button onClick={onAdd}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>
    </>
  );
}
