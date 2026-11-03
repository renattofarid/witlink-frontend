import { PackageCheck } from "lucide-react";
import type { ModelComplete } from "@/lib/core.interface";

export const KitsDescargaComplete: ModelComplete = {
  MODEL: { name: "Kit de descarga", plural: "Kits de descarga", gender: false },
  ICON: PackageCheck,
  ENDPOINT: "/kits-descarga",
  QUERY_KEY: "kits-descarga",
  ROUTE: "/kits-descarga",
  ABSOLUTE_ROUTE: "/kits-descarga",
};

export const KIT_ESTADOS = [
  { value: "BORRADOR", label: "Borrador" },
  { value: "PUBLICADO", label: "Publicado" },
  { value: "INACTIVO", label: "Inactivo" },
] as const;

export const KIT_RESULTADOS = [
  { value: "conforme", label: "Conforme" },
  { value: "exceso", label: "Exceso" },
  { value: "menor_consumo", label: "Menor consumo" },
  { value: "fuera_de_kit", label: "Fuera de kit" },
] as const;

