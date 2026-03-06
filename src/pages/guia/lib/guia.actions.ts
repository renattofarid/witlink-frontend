import { api } from "@/lib/config";
import { GuiaComplete } from "./guia.constants";
import type { GuiaResponse, GuiaResource, GuiaCreateBody, GuiaEditBody } from "./guia.interface";

export const getGuias = async (params: Record<string, string>): Promise<GuiaResponse> => {
  const { data } = await api.get(GuiaComplete.ENDPOINT, { params });
  return data;
};

export const getGuia = async (id: number): Promise<GuiaResource> => {
  const { data } = await api.get(`${GuiaComplete.ENDPOINT}/${id}`);
  return data;
};

export const createGuia = async (body: GuiaCreateBody) => {
  const { data } = await api.post(GuiaComplete.ENDPOINT, body);
  return data;
};

export const updateGuia = async (id: number, body: GuiaEditBody) => {
  const { data } = await api.put(`${GuiaComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteGuia = async (id: number) => {
  const { data } = await api.delete(`${GuiaComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreGuia = async (id: number) => {
  const { data } = await api.post(`${GuiaComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};

export const getProveedores = async (params: Record<string, any>) => {
  const { data } = await api.get("/proveedores", { params });
  return data;
};

export const getProductos = async (params: Record<string, any>) => {
  const { data } = await api.get("/productos", { params });
  return data;
};

export const getCategorias = async (params: Record<string, any>) => {
  const { data } = await api.get("/categorias", { params });
  return data;
};
