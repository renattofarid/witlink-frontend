import { api } from "@/lib/config";
import { OficinaComplete } from "./oficina.constants";
import type { OficinaResponse, OficinaResource, OficinaBody } from "./oficina.interface";

export const getOficinas = async (
  params: Record<string, string>
): Promise<OficinaResponse> => {
  const { data } = await api.get(OficinaComplete.ENDPOINT, { params });
  return data;
};

export const getOficina = async (id: number): Promise<OficinaResource> => {
  const { data } = await api.get(`${OficinaComplete.ENDPOINT}/${id}`);
  return data;
};

export const createOficina = async (body: OficinaBody) => {
  const { data } = await api.post(OficinaComplete.ENDPOINT, body);
  return data;
};

export const updateOficina = async (id: number, body: OficinaBody) => {
  const { data } = await api.put(`${OficinaComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteOficina = async (id: number) => {
  const { data } = await api.delete(`${OficinaComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreOficina = async (id: number) => {
  const { data } = await api.post(`${OficinaComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};
