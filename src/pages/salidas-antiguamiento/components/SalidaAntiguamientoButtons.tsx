import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SalidaAntiguamientoComplete } from "../lib/salida-antiguamiento.constants";

export default function SalidaAntiguamientoButtons() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(SalidaAntiguamientoComplete.ROUTE_ADD!)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
