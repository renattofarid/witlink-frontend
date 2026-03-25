import { List } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const MaterialesComplete: ModelComplete = {
  MODEL: {
    name: "Material",
    plural: "Materiales",
    gender: false,
  },
  ICON: List,
  ENDPOINT: "/materiales",
  QUERY_KEY: "materiales",
  ROUTE: "/materiales",
  ABSOLUTE_ROUTE: "/materiales",
  ROUTE_ADD: "/materiales/agregar",
  ROUTE_UPDATE: "/materiales/editar",
};
