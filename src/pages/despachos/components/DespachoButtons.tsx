import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DespachoComplete } from "../lib/despacho.constants";

export default function DespachoButtons() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(DespachoComplete.ROUTE_ADD!)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
