import { api } from "@/lib/config";
import { CuadrillaComplete } from "./cuadrilla.constants";
import type {
  CuadrillaResponse,
  CuadrillaResource,
  CuadrillaBody,
} from "./cuadrilla.interface";

export const getCuadrillas = async (
  params: Record<string, string>,
): Promise<CuadrillaResponse> => {
  const { data } = await api.get(CuadrillaComplete.ENDPOINT, { params });
  return data;
};

export const getCuadrilla = async (id: number): Promise<CuadrillaResource> => {
  const { data } = await api.get(`${CuadrillaComplete.ENDPOINT}/${id}`);
  return data;
};

export const createCuadrilla = async (body: CuadrillaBody) => {
  const { data } = await api.post(CuadrillaComplete.ENDPOINT, body);
  return data;
};

export const updateCuadrilla = async (id: number, body: CuadrillaBody) => {
  const { data } = await api.put(`${CuadrillaComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteCuadrilla = async (id: number) => {
  const { data } = await api.delete(`${CuadrillaComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreCuadrilla = async (id: number) => {
  const { data } = await api.post(
    `${CuadrillaComplete.ENDPOINT}/${id}/restaurar`,
  );
  return data;
};
