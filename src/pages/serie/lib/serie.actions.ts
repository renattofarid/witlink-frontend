import { api } from "@/lib/config";
import { SerieComplete } from "./serie.constants";
import type {
  SerieResponse,
  SerieResource,
  SerieBody,
  SerieValidacionResponse,
} from "./serie.interface";

export interface ExcelResponse {
  file_name: string;
  mime_type: string;
  file_base64: string;
}

export const getSeries = async (
  params: Record<string, string>
): Promise<SerieResponse> => {
  const { data } = await api.get(SerieComplete.ENDPOINT, { params });
  return data;
};

export const getSerie = async (id: number): Promise<SerieResource> => {
  const { data } = await api.get(`${SerieComplete.ENDPOINT}/${id}`);
  return data;
};

export const createSerie = async (body: SerieBody) => {
  const { data } = await api.post(SerieComplete.ENDPOINT, body);
  return data;
};

export const deleteSerie = async (id: number) => {
  const { data } = await api.delete(`${SerieComplete.ENDPOINT}/${id}`);
  return data;
};

export const confirmarDisponibilidadSerie = async (id: number) => {
  const { data } = await api.post(`${SerieComplete.ENDPOINT}/${id}/confirmar-disponibilidad`);
  return data;
};

export const validarSerie = async (
  serie: string,
  almacenId?: number | null,
): Promise<SerieValidacionResponse> => {
  const { data } = await api.get(
    `${SerieComplete.ENDPOINT}/${encodeURIComponent(serie)}/validar`,
    { params: almacenId ? { almacen_id: almacenId } : undefined },
  );
  return data;
};

export const exportSeries = async (formato: "xlsx" | "csv"): Promise<ExcelResponse> => {
  const { data } = await api.get<ExcelResponse>("/inventarios/series/exportar-excel", {
    params: { formato },
  });
  return data;
};
