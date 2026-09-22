import { api } from "@/lib/config";
import { KardexComplete } from "./kardex.constants";
import type { KardexResponse } from "./kardex.interface";

function buildKardexBody(params: Record<string, string>) {
  const { almacen_id, productos, page, per_page, ...rest } = params;
  const body: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value !== "") body[key] = value;
  }

  if (page) body.page = Number(page);
  if (per_page) body.per_page = Number(per_page);
  if (almacen_id) body.almacen_id = Number(almacen_id);
  if (productos) body.productos = productos.split(",").filter(Boolean);

  return body;
}

export const getKardex = async (
  params: Record<string, string>,
): Promise<KardexResponse> => {
  const { data } = await api.post(KardexComplete.ENDPOINT, buildKardexBody(params));
  return data;
};
