import { api } from "@/lib/config";
import { SerieComplete } from "./serie.constants";
import type {
  SerieResponse,
  SerieResource,
  SerieBody,
  SerieValidacionResponse,
  ImportarSeriesExcelResult,
} from "./serie.interface";

export interface ExcelResponse {
  file_name: string;
  mime_type: string;
  file_base64: string;
}

export const getSeries = async (
  params: Record<string, unknown>
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

export const descargarPlantillaSeries = async (): Promise<ExcelResponse> => {
  const { data } = await api.get<ExcelResponse>(`${SerieComplete.ENDPOINT}/plantilla-importacion`);
  return data;
};

export const importarSeriesExcel = async (
  file: File,
  almacenId?: number | null,
): Promise<{ message: string; data: ImportarSeriesExcelResult }> => {
  const formData = new FormData();
  formData.append("archivo", file);
  if (almacenId) {
    formData.append("almacen_id", String(almacenId));
  }

  const { data } = await api.post<{ message: string; data: ImportarSeriesExcelResult }>(
    `${SerieComplete.ENDPOINT}/importar-excel`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};
