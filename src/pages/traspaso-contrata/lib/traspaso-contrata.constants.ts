import type { ModelComplete } from "@/lib/core.interface";
import { Truck } from "lucide-react";

export const TraspasoContrataComplete: ModelComplete = {
  MODEL: {
    name: "Traspaso a Contrata",
    plural: "Traspasos a Contrata",
    gender: true,
  },
  ICON: Truck,
  ROUTE: "/guias-salida/traspasos-contrata",
  QUERY_KEY: "traspasos-contrata",
  ABSOLUTE_ROUTE: "/guias-salida/traspasos-contrata",
  ENDPOINT: "/guias-salida/traspasos-contrata",
  ROUTE_ADD: "/guias-salida/traspasos-contrata/agregar",
};
