import { Package } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const InventarioTecnicoComplete: ModelComplete = {
  MODEL: {
    name: "Inventario de Técnico",
    plural: "Inventario de Técnico",
    gender: false,
  },
  ICON: Package,
  ENDPOINT: "/tecnicos",
  QUERY_KEY: "inventario-tecnico",
  ROUTE: "/inventario-tecnico",
  ABSOLUTE_ROUTE: "/inventario-tecnico",
};
