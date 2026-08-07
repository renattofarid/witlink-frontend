import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface SotRemisionButtonsProps {
  onImport: () => void;
}

export default function SotRemisionButtons({ onImport }: SotRemisionButtonsProps) {
  return (
    <Button onClick={onImport}>
      <Upload className="size-4 mr-1" />
      Importar Excel
    </Button>
  );
}
