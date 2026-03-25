import { api } from "@/lib/config";
import { MaterialesComplete } from "./materiales.constants";
import type { MaterialResponse, MaterialResource, MaterialBody } from "./materiales.interface";

export const getMateriales = async (
  params: Record<string, string>
): Promise<MaterialResponse> => {
  const { data } = await api.get(MaterialesComplete.ENDPOINT, { params });
  return data;
};

export const getMaterial = async (id: number): Promise<MaterialResource> => {
  const { data } = await api.get(`${MaterialesComplete.ENDPOINT}/${id}`);
  return data;
};

export const createMaterial = async (body: MaterialBody) => {
  const { data } = await api.post(MaterialesComplete.ENDPOINT, body);
  return data;
};

export const updateMaterial = async (id: number, body: MaterialBody) => {
  const { data } = await api.put(`${MaterialesComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteMaterial = async (id: number) => {
  const { data } = await api.delete(`${MaterialesComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreMaterial = async (id: number) => {
  const { data } = await api.post(`${MaterialesComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};
