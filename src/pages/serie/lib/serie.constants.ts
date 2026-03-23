import { List } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const SerieComplete: ModelComplete = {
  MODEL: {
    name: "Serie",
    plural: "Series",
    gender: true,
  },
  ICON: List,
  ENDPOINT: "/series",
  QUERY_KEY: "serie",
  ROUTE: "/serie",
  ABSOLUTE_ROUTE: "/serie",
};
