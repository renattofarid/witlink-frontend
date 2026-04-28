import { api } from "@/lib/config";
import { SerieComplete } from "./serie.constants";
import type { SerieResponse, SerieResource, SerieBody } from "./serie.interface";

export const getSeries = async (
  params: Record<string, string>
): Promise<SerieResponse> => {
  const { data } = await api.get(SerieComplete.ENDPOINT, { params });
  return data;
};

export const getSerie = async (id: number): Promise<SerieResource> => {
  const { data } = await api.get(`${SerieComplete.ENDPOINT}/${id}`);
  return data;
};

export const createSerie = async (body: SerieBody) => {
  const { data } = await api.post(SerieComplete.ENDPOINT, body);
  return data;
};

export const deleteSerie = async (id: number) => {
  const { data } = await api.delete(`${SerieComplete.ENDPOINT}/${id}`);
  return data;
};

export const confirmarDisponibilidadSerie = async (id: number) => {
  const { data } = await api.post(`${SerieComplete.ENDPOINT}/${id}/confirmar-disponibilidad`);
  return data;
};
