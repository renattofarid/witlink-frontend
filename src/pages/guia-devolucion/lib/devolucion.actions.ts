import { api } from "@/lib/config";
import { GuiaDevolucionComplete } from "./devolucion.constants";
import type {
  GuiaDevolucionCreateBody,
  GuiaDevolucionListResponse,
  GuiaDevolucionResource,
  DevolucionDestinosResponse,
  SerieRetiradaResponse,
} from "./devolucion.interface";

export const getGuiasDevolucion = async (
  params: Record<string, string>,
): Promise<GuiaDevolucionListResponse> => {
  const {
    fecha_emision_desde,
    fecha_emision_hasta,
    fecha_traslado_desde,
    fecha_traslado_hasta,
    ...rest
  } = params;

  const search = new URLSearchParams();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });
  if (fecha_emision_desde || fecha_emision_hasta) {
    search.append("fecha_emision[]", fecha_emision_desde || fecha_emision_hasta);
    search.append("fecha_emision[]", fecha_emision_hasta || fecha_emision_desde);
  }
  if (fecha_traslado_desde || fecha_traslado_hasta) {
    search.append("fecha_traslado[]", fecha_traslado_desde || fecha_traslado_hasta);
    search.append("fecha_traslado[]", fecha_traslado_hasta || fecha_traslado_desde);
  }

  const { data } = await api.get(`${GuiaDevolucionComplete.ENDPOINT}?${search.toString()}`);
  return data;
};

export const getGuiaDevolucion = async (
  id: number,
): Promise<GuiaDevolucionResource> => {
  const { data } = await api.get(`${GuiaDevolucionComplete.ENDPOINT}/${id}`);
  return data;
};

export const getDestinosDevolucion = async (): Promise<DevolucionDestinosResponse> => {
  const { data } = await api.get(`${GuiaDevolucionComplete.ENDPOINT}/destinos`);
  return data;
};

export const getSeriesRetiradas = async (
  search: string,
): Promise<SerieRetiradaResponse> => {
  const { data } = await api.get(`${GuiaDevolucionComplete.ENDPOINT}/series-retiradas`, {
    params: { search },
  });
  return data;
};

export const createGuiaDevolucion = async (body: GuiaDevolucionCreateBody) => {
  const { data } = await api.post(GuiaDevolucionComplete.ENDPOINT, body);
  return data;
};

export const updateGuiaDevolucion = async (
  id: number,
  body: GuiaDevolucionCreateBody,
) => {
  const { data } = await api.put(`${GuiaDevolucionComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const anularGuiaDevolucion = async (id: number) => {
  const { data } = await api.delete(`${GuiaDevolucionComplete.ENDPOINT}/${id}`);
  return data;
};
