import { api } from "@/lib/config";
import { CuadrillaComplete } from "./cuadrilla.constants";
import type { CuadrillaResponse, CuadrillaResource, CuadrillaBody } from "./cuadrilla.interface";

export const getCuadrillas = async (params: Record<string, string>): Promise<CuadrillaResponse> => {
  const { data } = await api.get(CuadrillaComplete.endpoint, { params });
  return data;
};

export const getCuadrilla = async (id: number): Promise<CuadrillaResource> => {
  const { data } = await api.get(`${CuadrillaComplete.endpoint}/${id}`);
  return data;
};

export const createCuadrilla = async (body: CuadrillaBody) => {
  const { data } = await api.post(CuadrillaComplete.endpoint, body);
  return data;
};

export const updateCuadrilla = async (id: number, body: CuadrillaBody) => {
  const { data } = await api.put(`${CuadrillaComplete.endpoint}/${id}`, body);
  return data;
};

export const deleteCuadrilla = async (id: number) => {
  const { data } = await api.delete(`${CuadrillaComplete.endpoint}/${id}`);
  return data;
};

export const restoreCuadrilla = async (id: number) => {
  const { data } = await api.post(`${CuadrillaComplete.endpoint}/${id}/restaurar`);
  return data;
};
