import { List } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const TrasladoComplete: ModelComplete = {
  MODEL: {
    name: "traslado",
    plural: "traslados",
    gender: false,
  },
  ICON: List,
  ENDPOINT: "/series",
  QUERY_KEY: "traslados",
  ROUTE: "/traslados",
  ABSOLUTE_ROUTE: "/traslados",
  ROUTE_ADD: "/traslados/agregar",
};
