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
  return data;
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
