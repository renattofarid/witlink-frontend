import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExportButtons from "@/components/ExportButtons";

interface MaterialesButtonsProps {
  onAdd: () => void;
}

export default function MaterialesButtons({ onAdd }: MaterialesButtonsProps) {
  return (
    <>
      <ExportButtons
        excelEndpoint="/inventarios/materiales/exportar-excel"
        excelFileName="materiales.xlsx"
        excelResponseFormat="base64"
      />
      <Button onClick={onAdd}>
        <Plus className="size-4 mr-1" />
        Agregar
      </Button>
    </>
  );
}
