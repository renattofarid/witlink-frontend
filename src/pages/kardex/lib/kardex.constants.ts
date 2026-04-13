import { ScrollText } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const KardexComplete: ModelComplete = {
  MODEL: {
    name: "Kardex",
    plural: "Kardex",
    gender: false,
  },
  ICON: ScrollText,
  ENDPOINT: "/movimientos/kardex",
  QUERY_KEY: "kardex",
  ROUTE: "/kardex",
  ABSOLUTE_ROUTE: "/kardex",
};
