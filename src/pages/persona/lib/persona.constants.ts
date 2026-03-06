import type { ModelComplete } from "@/lib/core.interface";
import { Users } from "lucide-react";

export const PersonaComplete: ModelComplete = {
  MODEL: {
    name: "Persona",
    plural: "Personas",
    gender: true,
  },
  ICON: Users,
  ENDPOINT: "/personas",
  QUERY_KEY: "personas",
  ROUTE: "/persona",
  ABSOLUTE_ROUTE: "/persona",
  ROUTE_ADD: "/persona/agregar",
  ROUTE_UPDATE: "/persona/editar",
};
