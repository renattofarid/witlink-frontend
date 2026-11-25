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

export const DESCRIPCION_SOLICITUD_OPTIONS = [
  { value: "POST VENTA", label: "POST VENTA" },
  { value: "CAMBIO POR INCIDENCIA", label: "CAMBIO POR INCIDENCIA" },
] as const;

export const DESCRIPCION_SOLICITUD_DEFAULT = "POST VENTA";
