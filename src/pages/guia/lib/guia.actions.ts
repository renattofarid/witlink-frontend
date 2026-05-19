import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";
import { GuiaComplete } from "./guia.constants";
import type {
  GuiaResponse,
  GuiaResource,
  GuiaCreateBody,
  GuiaEditBody,
  GuiaProductoBody,
} from "./guia.interface";
import type { AxiosRequestConfig } from "axios";

export async function openPdf(ruta: string) {
  const promise = api
    .post("/archivos", { ruta_pdf: ruta }, { responseType: "blob" })
    .then((response) => {
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ruta;
      a.click();
      window.open(url);
    });
  promiseToast(promise, {
    loading: "Descargando PDF...",
    success: "PDF descargado",
    error: "Error al descargar el PDF",
  });
}

export const getGuias = async (
  params: Record<string, string>,
): Promise<GuiaResponse> => {
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
  const formData = buildGuiaEditFormData(body);
  formData.append("_method", "PUT");
  const { data } = await api.post(`${GuiaComplete.ENDPOINT}/${id}`, formData);
  return data;
};

function appendProductoFields(
  formData: FormData,
  prefix: string,
  producto: GuiaProductoBody,
) {
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
  formData.append(`${prefix}[origen]`, producto.origen ?? "");
  if (producto.necesita_serie !== undefined && producto.necesita_serie !== null)
    formData.append(
      `${prefix}[necesita_serie]`,
      producto.necesita_serie ? "1" : "0",
    );
  if (producto.necesita_mac !== undefined && producto.necesita_mac !== null)
    formData.append(
      `${prefix}[necesita_mac]`,
      producto.necesita_mac ? "1" : "0",
    );
  if (
    producto.necesita_emta_mac !== undefined &&
    producto.necesita_emta_mac !== null
  )
    formData.append(
      `${prefix}[necesita_emta_mac]`,
      producto.necesita_emta_mac ? "1" : "0",
    );
  if (producto.necesita_ua !== undefined && producto.necesita_ua !== null)
    formData.append(`${prefix}[necesita_ua]`, producto.necesita_ua ? "1" : "0");
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
    if (serie.emta_mac !== undefined && serie.emta_mac !== null)
      formData.append(`${sprefix}[emta_mac]`, serie.emta_mac);
    if (serie.ua !== undefined && serie.ua !== null)
      formData.append(`${sprefix}[ua]`, serie.ua);
    if (serie.observaciones !== undefined && serie.observaciones !== null)
      formData.append(`${sprefix}[observaciones]`, serie.observaciones);
  });
}

function buildGuiaFormData(body: GuiaCreateBody): FormData {
  const formData = new FormData();
  formData.append("numero", body.numero);
  formData.append("fecha", body.fecha);
  // formData.append("proveedor_id", String(body.proveedor_id));
  if (body.archivo) formData.append("archivo", body.archivo);

  body.productos.forEach((producto, i) => {
    appendProductoFields(formData, `productos[${i}]`, producto);
  });

  return formData;
}

function buildGuiaEditFormData(body: GuiaEditBody): FormData {
  const formData = new FormData();
  if (body.numero != null) formData.append("numero", body.numero);
  if (body.fecha != null) formData.append("fecha", body.fecha);
  if (body.archivo) formData.append("archivo", body.archivo);

  // productos[0][añadir][i][...] → dot-notation: productos.0.añadir.i.* → matches productos.*.añadir.*.*
  (body.productos?.añadir ?? []).forEach((producto, i) => {
    appendProductoFields(formData, `productos[0][añadir][${i}]`, producto);
  });

  // productos[0][actualizar][i][...] → dot-notation: productos.0.actualizar.i.* → matches productos.*.actualizar.*.*
  (body.productos?.actualizar ?? []).forEach((producto, i) => {
    const prefix = `productos[0][actualizar][${i}]`;
    formData.append(`${prefix}[id]`, String(producto.id));
    if (producto.cantidad != null)
      formData.append(`${prefix}[cantidad]`, String(producto.cantidad));
    if (producto.observaciones != null)
      formData.append(`${prefix}[observaciones]`, producto.observaciones);

    // series[0][actualizar][j][...] → matches productos.*.actualizar.*.series.*.actualizar.*.*
    (producto.series?.actualizar ?? []).forEach((serie, j) => {
      const sprefix = `${prefix}[series][0][actualizar][${j}]`;
      formData.append(`${sprefix}[serie_id]`, String(serie.serie_id));
      if (serie.serie != null)
        formData.append(`${sprefix}[serie]`, serie.serie);
      if (serie.mac != null) formData.append(`${sprefix}[mac]`, serie.mac);
      if (serie.emta_mac != null)
        formData.append(`${sprefix}[emta_mac]`, serie.emta_mac);
      if (serie.ua != null) formData.append(`${sprefix}[ua]`, serie.ua);
      if (serie.observaciones != null)
        formData.append(`${sprefix}[observaciones]`, serie.observaciones);
    });

    // series[0][añadir][j][...] → matches productos.*.actualizar.*.series.*.añadir.*.*
    (producto.series?.añadir ?? []).forEach((serie, j) => {
      const sprefix = `${prefix}[series][0][añadir][${j}]`;
      if (serie.serie_id != null)
        formData.append(`${sprefix}[serie_id]`, String(serie.serie_id));
      if (serie.serie != null)
        formData.append(`${sprefix}[serie]`, serie.serie);
      if (serie.mac != null) formData.append(`${sprefix}[mac]`, serie.mac);
      if (serie.emta_mac != null)
        formData.append(`${sprefix}[emta_mac]`, serie.emta_mac);
      if (serie.ua != null) formData.append(`${sprefix}[ua]`, serie.ua);
      if (serie.observaciones != null)
        formData.append(`${sprefix}[observaciones]`, serie.observaciones);
    });
  });

  return formData;
}

export const confirmarSerie = async (
  productoGuiaId: number,
  serieId: number,
) => {
  const { data } = await api.patch(
    `/detalle-series-guia/${productoGuiaId}/${serieId}`,
  );
  return data;
};

export const confirmarProducto = async (id: number) => {
  const { data } = await api.patch(
    `/productos-guia/${id}/confirmar-disponibilidad`,
  );
  return data;
};

export const confirmarDisponibilidad = async (id: number) => {
  const { data } = await api.patch(
    `${GuiaComplete.ENDPOINT}/${id}/confirmarDisponibilidad`,
  );
  return data;
};

export const deleteProductoGuia = async (id: number) => {
  const config: AxiosRequestConfig = {
    params: {
      forzar: 1,
    },
  };
  const { data } = await api.delete(`/productos-guia/${id}`, config);
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

export const getCategoriaById = async (id: number) => {
  const { data } = await api.get(`/categorias/${id}`);
  return data;
};
