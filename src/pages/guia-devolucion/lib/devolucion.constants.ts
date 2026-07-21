import type { ModelComplete } from "@/lib/core.interface";
import { ClipboardList } from "lucide-react";

export const GuiaDevolucionComplete: ModelComplete = {
  MODEL: {
    name: "Guías de Devolución",
    plural: "Guías",
    gender: true,
  },
  ICON: ClipboardList,
  ROUTE: "/guias-devolucion",
  QUERY_KEY: "guias-devolucion",
  ABSOLUTE_ROUTE: "/guias-devolucion",
  ENDPOINT: "/guias-devolucion",
  ROUTE_ADD: "/guias-devolucion/agregar",
  ROUTE_UPDATE: "/guias-devolucion/editar",
};

export const GUIA_ROUTE_VIEW = "/guias-devolucion/ver";
