import { User } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const TecnicoComplete: ModelComplete = {
  MODEL: {
    name: "Técnico",
    plural: "Técnicos",
    gender: false,
  },
  ICON: User,
  ENDPOINT: "/tecnicos",
  QUERY_KEY: "tecnicos",
  ROUTE: "/tecnicos",
  ABSOLUTE_ROUTE: "/tecnicos",
  ROUTE_ADD: "/tecnicos/agregar",
  ROUTE_UPDATE: "/tecnicos/editar/:id",
};
