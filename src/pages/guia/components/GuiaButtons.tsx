import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GuiaComplete } from "../lib/guia.constants";

export default function GuiaButtons() {
  const navigate = useNavigate();
  return (
    <Button size="sm" onClick={() => navigate(GuiaComplete.ROUTE_ADD)}>
      <Plus className="size-4 mr-1" />
      Agregar
    </Button>
  );
}
