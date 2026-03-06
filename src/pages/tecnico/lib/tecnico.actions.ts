import { api } from "@/lib/config";
import { TecnicoComplete } from "./tecnico.constants";
import type {
  TecnicoResponse,
  TecnicoResource,
  TecnicoCreateBody,
  TecnicoEditBody,
} from "./tecnico.interface";

export const getTecnicos = async (
  params: Record<string, string>,
): Promise<TecnicoResponse> => {
  const { data } = await api.get(TecnicoComplete.ENDPOINT, { params });
  return data;
};

export const getTecnicosAll = async (): Promise<TecnicoResource[]> => {
  const { data } = await api.get(TecnicoComplete.ENDPOINT);
  return data;
};

export const getTecnico = async (id: number): Promise<TecnicoResource> => {
  const { data } = await api.get(`${TecnicoComplete.ENDPOINT}/${id}`);
  return data;
};

export const createTecnico = async (body: TecnicoCreateBody) => {
  const { data } = await api.post(TecnicoComplete.ENDPOINT, body);
  return data;
};

export const updateTecnico = async (id: number, body: TecnicoEditBody) => {
  const { data } = await api.put(`${TecnicoComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteTecnico = async (id: number) => {
  const { data } = await api.delete(`${TecnicoComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreTecnico = async (id: number) => {
  const { data } = await api.post(`${TecnicoComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};
