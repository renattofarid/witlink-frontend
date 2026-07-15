import { api } from "@/lib/config";
import { DesasignacionComplete } from "./desasignacion.constants";
import type {
  DesasignacionResponse,
  DesasignacionDetailResource,
  DesasignacionCreateBody,
} from "./desasignacion.interface";

export const getDesasignaciones = async (
  params: Record<string, any>,
): Promise<DesasignacionResponse> => {
  const { data } = await api.get(DesasignacionComplete.ENDPOINT, { params });

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

export const getDesasignacion = async (
  id: number,
): Promise<DesasignacionDetailResource> => {
  const { data } = await api.get(`${DesasignacionComplete.ENDPOINT}/${id}`);
  return data;
};

export const createDesasignacion = async (body: DesasignacionCreateBody) => {
  const { data } = await api.post(DesasignacionComplete.ENDPOINT, body);
  return data;
};
