import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EquipoRetiradoComplete } from "../lib/equipo-retirado.constants";

export default function EquipoRetiradoButtons() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(EquipoRetiradoComplete.ROUTE_ADD!)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
