import { FileDown } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const GenerarCargasComplete: ModelComplete = {
  MODEL: {
    name: "Generar Cargas",
    plural: "Generar Cargas",
    gender: false,
  },
  ICON: FileDown,
  ENDPOINT: "/personas",
  QUERY_KEY: "generar-cargas",
  ROUTE: "/generar-cargas",
  ABSOLUTE_ROUTE: "/generar-cargas",
};
