import { api } from "@/lib/config";
import { SalidaAntiguamientoComplete } from "./salida-antiguamiento.constants";
import type {
  SalidaAntiguamientoResponse,
  SalidaAntiguamientoDetailResource,
  SalidaAntiguamientoCreateBody,
} from "./salida-antiguamiento.interface";

export const getSalidasAntiguamiento = async (
  params: Record<string, any>,
): Promise<SalidaAntiguamientoResponse> => {
  const { data } = await api.get(SalidaAntiguamientoComplete.ENDPOINT, { params });

  if (data?.meta) return data;

  const {
    data: items,
    current_page,
    from,
    last_page,
    links,
    path,
    per_page,
    to,
    total,
  } = data;

  return {
    data: items,
    links: { first: data.first_page_url, last: data.last_page_url, prev: data.prev_page_url, next: data.next_page_url },
    meta: { current_page, from, last_page, links, path, per_page, to, total },
  };
};

export const getSalidaAntiguamiento = async (
  id: number,
): Promise<SalidaAntiguamientoDetailResource> => {
  const { data } = await api.get(`${SalidaAntiguamientoComplete.ENDPOINT}/${id}`);
  return data;
};

export const createSalidaAntiguamiento = async (
  body: SalidaAntiguamientoCreateBody,
) => {
  const { data } = await api.post(SalidaAntiguamientoComplete.ENDPOINT, body);
  return data;
};
