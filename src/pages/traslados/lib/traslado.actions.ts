import { api } from "@/lib/config";
import type {
  TrasladoResource,
  TrasladoSerieCreateBody,
  TrasladoMaterialCreateBody,
} from "./traslado.interface";

export const getTraslados = async (
  serieId: number,
): Promise<TrasladoResource[]> => {
  const { data } = await api.get(`/series/${serieId}/movimientos`);
  return data;
};

export const createTrasladoSerie = async (
  serieId: number,
  body: TrasladoSerieCreateBody,
) => {
  const { data } = await api.post(`/traslados/series/${serieId}`, body);
  return data;
};

export const createTrasladoMaterial = async (
  materialId: number,
  body: TrasladoMaterialCreateBody,
) => {
  const { data } = await api.post(`/traslados/materiales/${materialId}`, body);
  return data;
};
