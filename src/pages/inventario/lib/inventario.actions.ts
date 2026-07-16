import { api } from "@/lib/config";
import type {
  InventarioSerieResponse,
  InventarioMaterialResponse,
  SerieMovimientoResource,
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

export const devolverInventarioMaterial = async (productoId: number, cantidad: number) => {
  const { data } = await api.post(`/inventarios/materiales/${productoId}/devolver`, { cantidad });
  return data;
};

export const devolverInventarioSerie = async (inventarioTecnicoId: number) => {
  const { data } = await api.post(`/inventarios/series/${inventarioTecnicoId}/devolver`);
  return data;
};

export const devolverClaroInventarioSerie = async (
  serieId: number,
  contabilizado: string,
) => {
  const { data } = await api.patch(`/inventarios/series/${serieId}/devolver-claro`, {
    contabilizado,
  });
  return data;
};

export const getSerieMovimientos = async (serieId: number): Promise<SerieMovimientoResource[]> => {
  const { data } = await api.get(`/series/${serieId}/movimientos`);
  return data;
};
