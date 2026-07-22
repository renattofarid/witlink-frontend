import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GuiaDevolucionComplete } from "../lib/devolucion.constants";

export default function DevolucionButtons() {
  const navigate = useNavigate();

  return (
    <Button size="sm" onClick={() => navigate(GuiaDevolucionComplete.ROUTE_ADD!)}>
      <Plus />
      Agregar
    </Button>
  );
}
