import { api } from "@/lib/config";
import { SotRemisionComplete } from "./sot-remision.constants";
import type {
  SotRemisionResponse,
  SotRemisionConsultaResponse,
  ImportarSotRemisionExcelResponse,
} from "./sot-remision.interface";

export const getSotsRemision = async (
  params: Record<string, string>,
): Promise<SotRemisionResponse> => {
  const { data } = await api.get(SotRemisionComplete.ENDPOINT, { params });
  return data;
};

export const getSotRemision = async (
  sot: string,
): Promise<SotRemisionConsultaResponse> => {
  const { data } = await api.get(
    `${SotRemisionComplete.ENDPOINT}/${encodeURIComponent(sot)}`,
  );
  return data;
};

export const importarSotRemisionExcel = async (
  archivo: File,
): Promise<ImportarSotRemisionExcelResponse> => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const { data } = await api.post(
    `${SotRemisionComplete.ENDPOINT}/importar-excel`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};
