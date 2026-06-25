import { api } from "@/lib/config";
import { AlmacenComplete } from "./almacen.constants";
import type { AlmacenResponse, AlmacenResource, AlmacenBody } from "./almacen.interface";

export const getAlmacenes = async (
  params: Record<string, string>
): Promise<AlmacenResponse> => {
  const { data } = await api.get(AlmacenComplete.ENDPOINT, { params });
  return data;
};

export const getAlmacen = async (id: number): Promise<AlmacenResource> => {
  const { data } = await api.get(`${AlmacenComplete.ENDPOINT}/${id}`);
  return data;
};

export const createAlmacen = async (body: AlmacenBody) => {
  const { data } = await api.post(AlmacenComplete.ENDPOINT, body);
  return data;
};

export const updateAlmacen = async (id: number, body: AlmacenBody) => {
  const { data } = await api.put(`${AlmacenComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteAlmacen = async (id: number) => {
  const { data } = await api.delete(`${AlmacenComplete.ENDPOINT}/${id}`);
  return data;
};
