import { api } from "@/lib/config";
import { LiquidacionesComplete } from "./liquidaciones.constants";
import type {
  SotSearchResponse,
  LiquidacionesResponse,
  SaveProductosBody,
  SaveProductosResponse,
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
