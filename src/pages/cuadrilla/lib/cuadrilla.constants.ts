import type { ModelComplete } from "@/lib/core.interface";

export const CuadrillaComplete: ModelComplete = {
  MODEL: {
    name: "Cuadrilla",
    plural: "Cuadrillas",
    gender: true,
  },
  ICON: "CirclePile",
  ENDPOINT: "/cuadrillas",
  QUERY_KEY: "cuadrillas",
  ROUTE: "/cuadrilla",
  ABSOLUTE_ROUTE: "/cuadrilla",
  ROUTE_ADD: "/cuadrilla/agregar",
  ROUTE_UPDATE: "/cuadrilla/actualizar",
};
