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
  const formData = buildGuiaFormData(body);
  const { data } = await api.post(GuiaComplete.ENDPOINT, formData);
  return data;
};

export const updateGuia = async (id: number, body: GuiaEditBody) => {
  const formData = buildGuiaFormData(body);
  formData.append("_method", "PUT");
  const { data } = await api.post(`${GuiaComplete.ENDPOINT}/${id}`, formData);
  return data;
};

function buildGuiaFormData(body: GuiaCreateBody): FormData {
  const formData = new FormData();
  formData.append("numero", body.numero);
  formData.append("fecha", body.fecha);
  formData.append("proveedor_id", String(body.proveedor_id));
  if (body.archivo) formData.append("archivo", body.archivo);

  body.productos.forEach((producto, i) => {
    const prefix = `productos[${i}]`;
    if (producto.producto_id !== undefined)
      formData.append(`${prefix}[producto_id]`, String(producto.producto_id));
    if (producto.categoria_id !== undefined && producto.categoria_id !== null)
      formData.append(`${prefix}[categoria_id]`, String(producto.categoria_id));
    if (producto.sap !== undefined && producto.sap !== null)
      formData.append(`${prefix}[sap]`, producto.sap);
    if (producto.nombre !== undefined && producto.nombre !== null)
      formData.append(`${prefix}[nombre]`, producto.nombre);
    if (producto.tipo !== undefined && producto.tipo !== null)
      formData.append(`${prefix}[tipo]`, producto.tipo);
    formData.append(`${prefix}[cantidad]`, String(producto.cantidad));
    if (producto.observaciones !== undefined && producto.observaciones !== null)
      formData.append(`${prefix}[observaciones]`, producto.observaciones);

    (producto.series ?? []).forEach((serie, j) => {
      const sprefix = `${prefix}[series][${j}]`;
      if (serie.serie_id !== undefined && serie.serie_id !== null)
        formData.append(`${sprefix}[serie_id]`, String(serie.serie_id));
      if (serie.serie !== undefined && serie.serie !== null)
        formData.append(`${sprefix}[serie]`, serie.serie);
      if (serie.mac !== undefined && serie.mac !== null)
        formData.append(`${sprefix}[mac]`, serie.mac);
      if (serie.ua !== undefined && serie.ua !== null)
        formData.append(`${sprefix}[ua]`, serie.ua);
      if (serie.observaciones !== undefined && serie.observaciones !== null)
        formData.append(`${sprefix}[observaciones]`, serie.observaciones);
    });
  });

  return formData;
}

export const deleteGuia = async (id: number) => {
  const { data } = await api.delete(`${GuiaComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreGuia = async (id: number) => {
  const { data } = await api.post(`${GuiaComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};

export const getSeries = async (params: Record<string, any>) => {
  const { data } = await api.get("/series", { params });
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
