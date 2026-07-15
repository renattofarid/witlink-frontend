import { Undo2 } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const DesasignacionComplete: ModelComplete = {
  MODEL: {
    name: "Desasignación",
    plural: "Desasignaciones",
    gender: true,
  },
  ICON: Undo2,
  ENDPOINT: "/desasignaciones",
  QUERY_KEY: "desasignaciones",
  ROUTE: "/desasignaciones",
  ABSOLUTE_ROUTE: "/desasignaciones",
  ROUTE_ADD: "/desasignaciones/agregar",
};

export const DESASIGNACION_ROUTE_VIEW = "/desasignaciones/ver";
