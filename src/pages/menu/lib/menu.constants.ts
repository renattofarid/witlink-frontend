import type { ModelComplete } from "@/lib/core.interface";
import { List } from "lucide-react";

export const MenuComplete: ModelComplete = {
  MODEL: {
    name: "Menú",
    plural: "Menús",
    gender: false,
  },
  ICON: List,
  ROUTE: "/menu",
  QUERY_KEY: "menu",
  ABSOLUTE_ROUTE: "/menu",
  ENDPOINT: "/grupo-menus",
  ROUTE_ADD: "/menu/agregar",
  ROUTE_UPDATE: "/menu/editar",
};

export const OPCION_MENU_ENDPOINT = "/opciones-menu";
export const OPCION_MENU_QUERY_KEY = "opcion-menu";
