import { api } from "@/lib/config";
import { CategoriaComplete } from "./categoria.constants";
import type {
  CategoriaResponse,
  CategoriaResource,
  CategoriaBody,
} from "./categoria.interface";

export const getCategorias = async (
  params: Record<string, string>
): Promise<CategoriaResponse> => {
  const { data } = await api.get(CategoriaComplete.endpoint, { params });
  return data;
};

export const getCategoria = async (id: number): Promise<CategoriaResource> => {
  const { data } = await api.get(`${CategoriaComplete.endpoint}/${id}`);
  return data;
};

export const createCategoria = async (body: CategoriaBody) => {
  const { data } = await api.post(CategoriaComplete.endpoint, body);
  return data;
};

export const updateCategoria = async (id: number, body: CategoriaBody) => {
  const { data } = await api.put(`${CategoriaComplete.endpoint}/${id}`, body);
  return data;
};

export const deleteCategoria = async (id: number) => {
  const { data } = await api.delete(`${CategoriaComplete.endpoint}/${id}`);
  return data;
};

export const restoreCategoria = async (id: number) => {
  const { data } = await api.post(
    `${CategoriaComplete.endpoint}/${id}/restaurar`
  );
  return data;
};
