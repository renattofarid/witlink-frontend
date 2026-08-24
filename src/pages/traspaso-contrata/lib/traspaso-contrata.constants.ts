import type { ModelComplete } from "@/lib/core.interface";
import { Truck } from "lucide-react";

export const TraspasoContrataComplete: ModelComplete = {
  MODEL: {
    name: "Traspaso a Contrata",
    plural: "Traspasos a Contrata",
    gender: true,
  },
  ICON: Truck,
  ROUTE: "/traspasos-contrata",
  QUERY_KEY: "traspasos-contrata",
  ABSOLUTE_ROUTE: "/traspasos-contrata",
  // Endpoint del backend: no cambia, sigue viviendo bajo /guias-salida/...
  ENDPOINT: "/guias-salida/traspasos-contrata",
  ROUTE_ADD: "/traspasos-contrata/agregar",
  ROUTE_UPDATE: "/traspasos-contrata/editar",
};
