import type { ModelComplete } from "@/lib/core.interface";
import { List } from "lucide-react";

export const EquipoRetiradoComplete: ModelComplete = {
  MODEL: {
    name: "Equipo Retirado",
    plural: "Equipos Retirados",
    gender: false,
  },
  ICON: List,
  ROUTE: "/equipos-retirados",
  QUERY_KEY: "equipos-retirados",
  ABSOLUTE_ROUTE: "/equipos-retirados",
  ENDPOINT: "/equipos-retirados",
  ROUTE_ADD: "/equipos-retirados/agregar",
  ROUTE_UPDATE: "/equipos-retirados/editar",
};
