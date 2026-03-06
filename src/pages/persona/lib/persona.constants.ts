import type { ModelComplete } from "@/lib/core.interface";

export const PersonaComplete: ModelComplete = {
  MODEL: {
    name: "Persona",
    plural: "Personas",
    gender: true,
  },
  ICON: "User2",
  ENDPOINT: "/personas",
  QUERY_KEY: "personas",
  ROUTE: "/persona",
  ABSOLUTE_ROUTE: "/persona",
  ROUTE_ADD: "/persona/agregar",
  ROUTE_UPDATE: "/persona/editar",
};
