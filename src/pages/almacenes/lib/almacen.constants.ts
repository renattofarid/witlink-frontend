import type { ModelComplete } from "@/lib/core.interface";
import { Box } from "lucide-react";

export const AlmacenComplete: ModelComplete = {
  MODEL: {
    name: "Almacén",
    plural: "Almacenes",
    gender: false,
  },
  ICON: Box,
  ROUTE: "/almacenes",
  QUERY_KEY: "almacenes",
  ABSOLUTE_ROUTE: "/almacenes",
  ENDPOINT: "/almacenes",
  ROUTE_ADD: "/almacenes/agregar",
  ROUTE_UPDATE: "/almacenes/editar",
};
