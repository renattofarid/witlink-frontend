import { api } from "@/lib/config";
import type {
  TrasladoResource,
  TrasladoListResponse,
  TrasladoCreateBody,
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

export const createTraslado = async (body: TrasladoCreateBody) => {
  const { data } = await api.post("/traslados", body);
  return data;
};

export const confirmarTraslado = async (id: number) => {
  const { data } = await api.patch(`/traslados/${id}/confirmar`);
  return data;
};

export const anularTraslado = async (id: number) => {
  const { data } = await api.patch(`/traslados/${id}/anular`);
  return data;
};
