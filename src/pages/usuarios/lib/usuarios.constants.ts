import type { ModelComplete } from "@/lib/core.interface";
import { Users } from "lucide-react";

export const UsuariosComplete: ModelComplete = {
  MODEL: {
    name: "Usuario",
    plural: "Usuarios",
    gender: false,
  },
  ICON: Users,
  ENDPOINT: "/usuarios",
  QUERY_KEY: "usuarios",
  ROUTE: "/usuarios",
  ABSOLUTE_ROUTE: "/usuarios",
  ROUTE_ADD: "/usuarios/agregar",
  ROUTE_UPDATE: "/usuarios/actualizar",
};
