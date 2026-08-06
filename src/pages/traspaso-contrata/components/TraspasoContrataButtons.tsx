import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";

export default function TraspasoContrataButtons() {
  const navigate = useNavigate();

  return (
    <Button
      size="sm"
      onClick={() => navigate(TraspasoContrataComplete.ROUTE_ADD!)}
    >
      <Plus />
      Agregar
    </Button>
  );
}
