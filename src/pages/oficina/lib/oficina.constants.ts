import type { ModelComplete } from "@/lib/core.interface";
import { Building } from "lucide-react";

export const OficinaComplete: ModelComplete = {
  MODEL: {
    name: "Almacen",
    plural: "Almacenes",
    gender: true,
  },
  ICON: Building,
  ROUTE: "/oficinas",
  QUERY_KEY: "oficinas",
  ABSOLUTE_ROUTE: "/oficinas",
  ENDPOINT: "/oficinas",
  ROUTE_ADD: "/oficinas/agregar",
  ROUTE_UPDATE: "/oficinas/editar",
};
