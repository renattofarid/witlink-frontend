import { List } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const DespachoComplete: ModelComplete = {
  MODEL: {
    name: "Despacho",
    plural: "Despachos",
    gender: false,
  },
  ICON: List,
  ENDPOINT: "/despachos",
  QUERY_KEY: "despachos",
  ROUTE: "/despachos",
  ABSOLUTE_ROUTE: "/despachos",
  ROUTE_ADD: "/despachos/agregar",
};
