import { api } from "@/lib/config";
import type {
  TrasladoResource,
  TrasladoCreateBody,
} from "./traslado.interface";

export const getTraslados = async (
  serieId: number,
): Promise<TrasladoResource[]> => {
  const { data } = await api.get(`/series/${serieId}/movimientos`);
  return data;
};

export const createTraslado = async (
  serieId: number,
  body: TrasladoCreateBody,
) => {
  const { data } = await api.post(`/series/${serieId}/ubicacion`, body);
  return data;
};
