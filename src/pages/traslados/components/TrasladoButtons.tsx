import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TrasladoComplete } from "../lib/traslado.constants";

export default function TrasladoButtons() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(TrasladoComplete.ROUTE_ADD!)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
