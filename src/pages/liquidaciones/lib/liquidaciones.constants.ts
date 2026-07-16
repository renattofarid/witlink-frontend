import { ClipboardList } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const LiquidacionesComplete: ModelComplete = {
  MODEL: {
    name: "Liquidación",
    plural: "Liquidaciones",
    gender: true,
  },
  ICON: ClipboardList,
  ENDPOINT: "/liquidaciones",
  QUERY_KEY: "liquidaciones",
  ROUTE: "/liquidaciones",
  ABSOLUTE_ROUTE: "/liquidaciones",
  ROUTE_ADD: "/liquidaciones/crear",
};

export const LIQUIDACION_ROUTE_VIEW = "/liquidaciones/ver";
export const LIQUIDACION_ROUTE_EDIT = "/liquidaciones/editar";

export const ESTADO_LIQUIDACION_OPTIONS = [
  { label: "Pendiente", value: "pendiente" },
  { label: "Liquidada", value: "liquidada" },
];

export const ESTADO_OPERATIVO_OPTIONS = [
  { label: "Rechazado", value: "RECHAZADO" },
  { label: "Atendida", value: "ATENDIDA" },
  { label: "Reprogramado", value: "REPROGRAMADO" },
  { label: "P. Validar", value: "P. VALIDAR" },
];
