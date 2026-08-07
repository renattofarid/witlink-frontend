import { FileSpreadsheet } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const SotRemisionComplete: ModelComplete = {
  MODEL: {
    name: "SOT Remisión",
    plural: "SOT Remisiones",
    gender: false,
  },
  ICON: FileSpreadsheet,
  ENDPOINT: "/sots-remision",
  QUERY_KEY: "sots-remision",
  ROUTE: "/sots-remision",
  ABSOLUTE_ROUTE: "/sots-remision",
};
