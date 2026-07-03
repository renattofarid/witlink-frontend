import { api } from "@/lib/config";
import { DespachoComplete } from "./despacho.constants";
import type {
  DespachoResponse,
  DespachoResource,
  DespachoCreateBody,
  MasivoSerieValidacionResponse,
  ReasignarTecnicoResponse,
} from "./despacho.interface";

export const getDespachos = async (
  params: Record<string, any>,
): Promise<DespachoResponse> => {
  const { data } = await api.get(DespachoComplete.ENDPOINT, { params });
  return data;
};

export const getDespacho = async (id: number): Promise<DespachoResource> => {
  const { data } = await api.get(`${DespachoComplete.ENDPOINT}/${id}`);
  return data;
};

export const createDespacho = async (body: DespachoCreateBody) => {
  const { data } = await api.post(DespachoComplete.ENDPOINT, body);
  return data;
};

export const deleteDespacho = async (id: number) => {
  const { data } = await api.delete(`${DespachoComplete.ENDPOINT}/${id}`);
  return data;
};

export const reasignarTecnicoDespacho = async (
  id: number,
  nuevo_tecnico_id: number,
): Promise<ReasignarTecnicoResponse> => {
  const { data } = await api.patch(
    `${DespachoComplete.ENDPOINT}/${id}/reasignar-tecnico`,
    { nuevo_tecnico_id },
  );
  return data;
};

export const getSeriesDisponibles = async (params: Record<string, any>) => {
  const { data } = await api.get("/series", { params });
  return data;
};

export const validateSerieDisponible = async (params: {
  serie: string;
  producto_id: number | string;
}): Promise<MasivoSerieValidacionResponse> => {
  const { data } = await api.get(`/series/${encodeURIComponent(params.serie)}/validar`, {
    params: { producto_id: params.producto_id },
  });
  return data;
};

export const validateSerieMasivoDisponible = async (
  serie: string,
): Promise<MasivoSerieValidacionResponse> => {
  const { data } = await api.get(`/series/${encodeURIComponent(serie)}/validar`);
  return data;
};
