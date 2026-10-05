import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";
import { TraspasoContrataComplete } from "../lib/traspaso-contrata.constants";

export default function TraspasoContrataButtons({ onManage }: { onManage: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onManage}>
        <Settings2 />
        Puntos de partida
      </Button>
      <Button size="sm" onClick={() => navigate(TraspasoContrataComplete.ROUTE_ADD!)}>
        <Plus />
        Agregar
      </Button>
    </div>
  );
}
