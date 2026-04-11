import { api } from "@/lib/config";
import type {
  InventarioSerieResponse,
  InventarioMaterialResponse,
} from "./inventario.interface";

export const getInventarioSeries = async (
  params: Record<string, string>,
): Promise<InventarioSerieResponse> => {
  const { data } = await api.get("/inventarios/series", { params });
  return data;
};

export const getInventarioMateriales = async (
  params: Record<string, string>,
): Promise<InventarioMaterialResponse> => {
  const { data } = await api.get("/inventarios/materiales", { params });
  return data;
};
