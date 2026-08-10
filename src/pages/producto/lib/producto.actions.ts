import { api } from "@/lib/config";
import { ProductoComplete } from "./producto.constants";
import type {
  ProductoResponse,
  ProductoResource,
  ProductoCreateBody,
  ProductoUpdateBody,
  ImportarSapResponse,
} from "./producto.interface";

export const getProductos = async (
  params: Record<string, string>
): Promise<ProductoResponse> => {
  const { data } = await api.get(ProductoComplete.ENDPOINT, { params });
  return data;
};

export const getProductosAll = async (
  params?: Record<string, string>
): Promise<ProductoResource[]> => {
  const { data } = await api.get(ProductoComplete.ENDPOINT, { params });
  return data?.data ?? data;
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

/**
 * Importación masiva de códigos SAP. El backend responde 201 cuando todo se
 * procesó sin errores y 422 cuando hubo filas omitidas con observaciones —
 * en ambos casos el body trae el mismo resumen útil (`creados`,
 * `actualizados`, `errores`, etc.), así que se trata el 422 como un
 * resultado válido en vez de un error de red.
 */
export const importarCodigosSap = async (
  archivo: File,
): Promise<ImportarSapResponse> => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  try {
    const { data } = await api.post(
      `${ProductoComplete.ENDPOINT}/importar-sap`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (error: any) {
    if (error?.response?.status === 422 && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};
