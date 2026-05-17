import { api } from "@/lib/config";
import { DespachoComplete } from "./despacho.constants";
import type {
  DespachoResponse,
  DespachoResource,
  DespachoCreateBody,
  DespachoMasivoSeriesBody,
} from "./despacho.interface";
import type { SerieResource } from "@/pages/serie/lib/serie.interface";

export const getDespachos = async (
  params: Record<string, string>,
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

export const getSeriesDisponibles = async (params: Record<string, any>) => {
  const { data } = await api.get("/series", { params });
  return data;
};

export const validateSerieDisponible = async (params: {
  serie: string;
  producto_id: number | string;
}): Promise<SerieResource> => {
  const { data } = await api.get("/series", {
    params: { buscar: params.serie, producto_id: params.producto_id },
  });
  const items: SerieResource[] = Array.isArray(data) ? data : (data.data ?? []);
  const match = items.find(
    (s) => s.serie?.toUpperCase() === params.serie.toUpperCase(),
  );
  if (!match) {
    const err: any = new Error("Serie no encontrada o no disponible");
    err.response = { data: { message: "Serie no encontrada o no disponible" } };
    throw err;
  }
  if (match.situacion_label !== "DISPONIBLE") {
    const err: any = new Error(`Serie ${match.situacion_label}`);
    err.response = {
      data: { message: `Serie no disponible (estado: ${match.situacion_label})` },
    };
    throw err;
  }
  return match;
};

export const createDespachoMasivoSeries = async (
  body: DespachoMasivoSeriesBody,
) => {
  const { data } = await api.post(
    `${DespachoComplete.ENDPOINT}/masivo-series`,
    body,
  );
  return data;
};
