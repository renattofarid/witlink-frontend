import { api } from "@/lib/config";
import { ProductoComplete } from "./producto.constants";
import type {
  ProductoResponse,
  ProductoResource,
  ProductoCreateBody,
  ProductoUpdateBody,
} from "./producto.interface";

export const getProductos = async (
  params: Record<string, string>
): Promise<ProductoResponse> => {
  const { data } = await api.get(ProductoComplete.ENDPOINT, { params });
  return data;
};

export const getProductosAll = async (): Promise<ProductoResource[]> => {
  const { data } = await api.get(ProductoComplete.ENDPOINT);
  return data;
};

export const getProducto = async (id: number): Promise<ProductoResource> => {
  const { data } = await api.get(`${ProductoComplete.ENDPOINT}/${id}`);
  return data;
};

export const createProducto = async (body: ProductoCreateBody) => {
  const { data } = await api.post(ProductoComplete.ENDPOINT, body);
  return data;
};

export const updateProducto = async (id: number, body: ProductoUpdateBody) => {
  const { data } = await api.put(`${ProductoComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteProducto = async (id: number) => {
  const { data } = await api.delete(`${ProductoComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreProducto = async (id: number) => {
  const { data } = await api.post(
    `${ProductoComplete.ENDPOINT}/${id}/restaurar`
  );
  return data;
};
