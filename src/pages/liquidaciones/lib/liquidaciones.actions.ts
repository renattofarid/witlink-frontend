import { api } from "@/lib/config";
import { LiquidacionesComplete } from "./liquidaciones.constants";
import type {
  SotSearchResponse,
  LiquidacionesResponse,
  SaveProductosBody,
  SaveProductosResponse,
  ActaResource,
} from "./liquidaciones.interface";

export const searchSot = async (sot: string): Promise<SotSearchResponse> => {
  const { data } = await api.get(
    `${LiquidacionesComplete.ENDPOINT}/${encodeURIComponent(sot)}`,
  );
  return data;
};

export const getLiquidaciones = async (
  params: Record<string, string>,
): Promise<LiquidacionesResponse> => {
  const { data } = await api.get(LiquidacionesComplete.ENDPOINT, { params });
  return data;
};

export const saveProductosLiquidacion = async (
  body: SaveProductosBody,
): Promise<SaveProductosResponse> => {
  const { data } = await api.post("/detalle-productos-liquidacion", body);
  return data;
};

export const deleteDetalleProducto = async (
  id: number,
  forzar: boolean = false,
) => {
  const { data } = await api.delete(`/detalle-productos-liquidacion/${id}`, {
    params: { forzar },
  });
  return data;
};

export const importarLiquidacionesCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("archivo", file);
  const { data } = await api.post(
    `${LiquidacionesComplete.ENDPOINT}/importar-csv`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

export const exportarResumenLiquidacion = async (
  liquidacionId: number,
): Promise<Blob> => {
  const { data } = await api.get(
    `${LiquidacionesComplete.ENDPOINT}/${liquidacionId}/exportar`,
    { responseType: "blob" },
  );
  return data;
};

export const getInventarioTecnicoLiquidacion = async (tecnicoId: number) => {
  const { data } = await api.get(`/tecnicos/${tecnicoId}/inventario`);
  return data;
};

export const importarActas = async (
  fecha: string,
  archivos: File[],
): Promise<unknown> => {
  const formData = new FormData();
  formData.append("fecha", fecha);
  archivos.forEach((file) => formData.append("archivos[]", file));
  const { data } = await api.post("/actas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getActaBySot = async (sot: string) => {
  const { data } = await api.get<ActaResource[]>(`/actas/${encodeURIComponent(sot)}`);
  return data;
};

export const getActaBlob = async (rutaArchivo: string): Promise<Blob> => {
  const { data } = await api.post("/archivos", { ruta_pdf: rutaArchivo }, { responseType: "blob" });
  return data;
};
