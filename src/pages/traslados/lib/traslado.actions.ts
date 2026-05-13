import { api } from "@/lib/config";
import type {
  TrasladoResource,
  TrasladoListResponse,
  TrasladoSerieCreateBody,
  TrasladoMaterialCreateBody,
} from "./traslado.interface";

export const getTraslados = async (
  serieId: number,
): Promise<TrasladoResource[]> => {
  const { data } = await api.get(`/series/${serieId}/movimientos`);
  return data;
};

export const getTrasladoList = async (
  params: Record<string, string>,
): Promise<TrasladoListResponse> => {
  const { data } = await api.get("/traslados", { params });
  return data;
};

export const createTrasladoSeries = async (body: TrasladoSerieCreateBody) => {
  const { data } = await api.post("/traslados/series", body);
  return data;
};

export const createTrasladoMateriales = async (
  body: TrasladoMaterialCreateBody,
) => {
  const { data } = await api.post("/traslados/materiales", body);
  return data;
};
