import { api } from "@/lib/config";
import type {
  InventarioSerieResponse,
  InventarioMaterialResponse,
} from "./inventario.interface";

function buildParams(params: Record<string, string>) {
  const { almacen_id, ...rest } = params;
  const result: Record<string, unknown> = { ...rest };
  if (almacen_id) {
    const ids = almacen_id.split(",").filter(Boolean);
    result["almacen_id[]"] = ids.length === 1 ? ids[0] : ids;
  }
  return result;
}

export const getInventarioSeries = async (
  params: Record<string, string>,
): Promise<InventarioSerieResponse> => {
  const { data } = await api.get("/inventarios/series", { params: buildParams(params) });
  return data;
};

export const getInventarioMateriales = async (
  params: Record<string, string>,
): Promise<InventarioMaterialResponse> => {
  const { data } = await api.get("/inventarios/materiales", { params: buildParams(params) });
  return data;
};
