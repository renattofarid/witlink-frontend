import { ClipboardList } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const InventarioComplete: ModelComplete = {
  MODEL: {
    name: "Inventario",
    plural: "Inventarios",
    gender: false,
  },
  ICON: ClipboardList,
  ENDPOINT: "/inventarios",
  QUERY_KEY: "inventario",
  ROUTE: "/inventario",
  ABSOLUTE_ROUTE: "/inventario",
};

export const INVENTARIO_SERIES_QUERY_KEY = "inventario-series";
export const INVENTARIO_MATERIALES_QUERY_KEY = "inventario-materiales";
