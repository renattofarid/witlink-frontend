import { Box } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const ProductoComplete: ModelComplete = {
  MODEL: {
    name: "Producto",
    plural: "Productos",
    gender: false,
  },
  ICON: Box,
  ENDPOINT: "/productos",
  QUERY_KEY: "productos",
  ROUTE: "/productos",
  ABSOLUTE_ROUTE: "/productos",
  ROUTE_ADD: "/productos/agregar",
  ROUTE_UPDATE: "/productos/editar",
};
