import type { ModelComplete } from "@/lib/core.interface";
import { List } from "lucide-react";

export const EquiposRetiradosComplete: ModelComplete = {
  MODEL: {
    name: "Equipo Retirado",
    plural: "Equipos Retirados",
    gender: false,
  },
  ICON: List,
  ENDPOINT: "/equipos-retirados",
  QUERY_KEY: "equipos-retirados",
  ROUTE: "/equipos-retirados",
  ABSOLUTE_ROUTE: "/equipos-retirados",
  ROUTE_ADD: "/equipos-retirados/agregar",
  ROUTE_UPDATE: "/equipos-retirados/editar",
};

export const TIPO_EQUIPO_RETIRADO_OPTIONS = [
  { value: "P", label: "Post Venta" },
  { value: "C", label: "Comercial" },
  { value: "O", label: "Operaciones" },
];
