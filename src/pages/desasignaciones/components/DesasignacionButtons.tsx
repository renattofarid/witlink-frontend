import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DesasignacionComplete } from "../lib/desasignacion.constants";

export default function DesasignacionButtons() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(DesasignacionComplete.ROUTE_ADD!)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
