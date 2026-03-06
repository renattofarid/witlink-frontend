import type { ModelComplete } from "@/lib/core.interface";
import { PersonStanding } from "lucide-react";

export const TipoUsuarioComplete: ModelComplete = {
  MODEL: {
    name: "Tipo de Usuario",
    plural: "Tipos de Usuario",
    gender: false,
  },
  ICON: PersonStanding,
  ENDPOINT: "/tipos-usuario",
  QUERY_KEY: "tipos-usuario",
  ROUTE: "/tipo-usuario",
  ABSOLUTE_ROUTE: "/tipo-usuario",
  ROUTE_ADD: "/tipo-usuario/agregar",
  ROUTE_UPDATE: "/tipo-usuario/actualizar",
};
