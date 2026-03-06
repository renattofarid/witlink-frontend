import { api } from "@/lib/config";
import { GuiaComplete } from "./guia.constants";
import type { GuiaResponse, GuiaResource, GuiaBody } from "./guia.interface";

export const getGuias = async (params: Record<string, string>): Promise<GuiaResponse> => {
  const { data } = await api.get(GuiaComplete.endpoint, { params });
  return data;
};

export const getGuia = async (id: number): Promise<GuiaResource> => {
  const { data } = await api.get(`${GuiaComplete.endpoint}/${id}`);
  return data;
};

export const createGuia = async (body: GuiaBody) => {
  const { data } = await api.post(GuiaComplete.endpoint, body);
  return data;
};

export const updateGuia = async (id: number, body: GuiaBody) => {
  const { data } = await api.put(`${GuiaComplete.endpoint}/${id}`, body);
  return data;
};

export const deleteGuia = async (id: number) => {
  const { data } = await api.delete(`${GuiaComplete.endpoint}/${id}`);
  return data;
};

export const restoreGuia = async (id: number) => {
  const { data } = await api.post(`${GuiaComplete.endpoint}/${id}/restaurar`);
  return data;
};
