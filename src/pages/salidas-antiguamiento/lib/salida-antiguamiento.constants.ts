import { Archive } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const SalidaAntiguamientoComplete: ModelComplete = {
  MODEL: {
    name: "Salida por Antigüamiento",
    plural: "Salidas por Antigüamiento",
    gender: true,
  },
  ICON: Archive,
  ENDPOINT: "/salidas-antiguamiento",
  QUERY_KEY: "salidas-antiguamiento",
  ROUTE: "/salidas-antiguamiento",
  ABSOLUTE_ROUTE: "/salidas-antiguamiento",
  ROUTE_ADD: "/salidas-antiguamiento/agregar",
};

export const SALIDA_ANTIGUAMIENTO_ROUTE_VIEW = "/salidas-antiguamiento/ver";
