import type { ModelComplete } from "@/lib/core.interface";
import { Boxes } from "lucide-react";

export const CategoriaComplete: ModelComplete = {
  MODEL: {
    name: "Categoría",
    plural: "Categorías",
    gender: true,
  },
  ICON: Boxes,
  ROUTE: "/categoria",
  QUERY_KEY: "categoria",
  ABSOLUTE_ROUTE: "/categoria",
  ENDPOINT: "/categoria",
  ROUTE_ADD: "/categoria/agregar",
  ROUTE_UPDATE: "/categoria/editar",
};
