import type { ModelComplete } from "@/lib/core.interface";
import { ClipboardList } from "lucide-react";

export const GuiaDevolucionComplete: ModelComplete = {
  MODEL: {
    name: "Guía de Devolución",
    plural: "Guías de Devolución",
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

export const MOTIVO_TRASLADO_DEFAULT = "13-DEVOLUCION CLARO";
