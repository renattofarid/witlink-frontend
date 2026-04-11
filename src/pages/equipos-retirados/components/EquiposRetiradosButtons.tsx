import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EquiposRetiradosComplete } from "../lib/equipos-retirados.constants";

export default function EquiposRetiradosButtons() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(EquiposRetiradosComplete.ROUTE_ADD!)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
