import { api } from "@/lib/config";
import type { ExcelResponse } from "@/lib/exportExcel";
import type {
  InventarioSerieResponse,
  InventarioMaterialResponse,
  SerieMovimientoResource,
} from "./inventario.interface";

function buildParams(params: Record<string, string>) {
  const { almacen_id, productos, ...rest } = params;
  const result: Record<string, unknown> = { ...rest };

  if (almacen_id) {
    result["almacen_id[]"] = almacen_id.split(",").filter(Boolean);
  }

  if (productos) {
    result["productos[]"] = productos.split(",").filter(Boolean);
  }

  return result;
}

/**
 * Builds the JSON body for the series search. It travels as a POST payload
 * (not a query string) so that bulk searches with many terms are not rejected
 * by IIS, which returns a 404 when the URL/query string exceeds its limit.
 */
function buildSeriesBody(params: Record<string, string>) {
  const { almacen_id, productos, page, per_page, ...rest } = params;
  const body: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value !== "") body[key] = value;
  }

  if (page) body.page = Number(page);
  if (per_page) body.per_page = Number(per_page);
  if (almacen_id) body.almacen_id = almacen_id.split(",").filter(Boolean);
  if (productos) body.productos = productos.split(",").filter(Boolean);

  return body;
}

export const getInventarioSeries = async (
  params: Record<string, string>,
): Promise<InventarioSerieResponse> => {
  const { data } = await api.post(
    "/inventarios/series",
    buildSeriesBody(params),
  );
  return data;
};

/**
 * Server-side Excel export of the series list. Sends the SAME filters as the
 * table (minus pagination) so the file contains every match, not just the
 * visible page.
 */
export const exportarInventarioSeriesExcel = async (
  params: Record<string, string>,
): Promise<ExcelResponse> => {
  const body = buildSeriesBody(params);
  delete body.page;
  delete body.per_page;
  const { data } = await api.post("/inventarios/series/exportar-excel", {
    ...body,
    formato: "xlsx",
  });
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

export const updateSot = async (serieId: number, sot: string) => {
  const { data } = await api.patch(
    `/inventarios/series/${serieId}/sot`,
    { sot }
  );

  return data;
};