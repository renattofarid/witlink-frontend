import type { ModelComplete } from "@/lib/core.interface";
import { ClipboardList } from "lucide-react";

export const GuiaComplete: ModelComplete = {
  MODEL: {
    name: "Guía",
    plural: "Guías",
    gender: true,
  },
  ICON: ClipboardList,
  ROUTE: "/guias",
  QUERY_KEY: "guias",
  ABSOLUTE_ROUTE: "/guias",
  ENDPOINT: "/guias",
  ROUTE_ADD: "/guias/agregar",
  ROUTE_UPDATE: "/guias/editar",
};
