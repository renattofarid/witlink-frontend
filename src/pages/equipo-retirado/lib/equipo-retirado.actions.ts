import { api } from "@/lib/config";
import { EquipoRetiradoComplete } from "./equipo-retirado.constants";
import type {
  EquipoRetiradoResponse,
  EquipoRetiradoResource,
  EquipoRetiradoBody,
} from "./equipo-retirado.interface";

export const getEquiposRetirados = async (
  params: Record<string, string>,
): Promise<EquipoRetiradoResponse> => {
  const { data } = await api.get(EquipoRetiradoComplete.ENDPOINT, { params });
  return data;
};

export const getEquipoRetirado = async (
  id: number,
): Promise<EquipoRetiradoResource> => {
  const { data } = await api.get(`${EquipoRetiradoComplete.ENDPOINT}/${id}`);
  return data;
};

export const createEquipoRetirado = async (body: EquipoRetiradoBody) => {
  const { data } = await api.post(EquipoRetiradoComplete.ENDPOINT, body);
  return data;
};

export const updateEquipoRetirado = async (
  id: number,
  body: EquipoRetiradoBody,
) => {
  const { data } = await api.put(
    `${EquipoRetiradoComplete.ENDPOINT}/${id}`,
    body,
  );
  return data;
};

export const deleteEquipoRetirado = async (id: number) => {
  const { data } = await api.delete(`${EquipoRetiradoComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreEquipoRetirado = async (id: number) => {
  const { data } = await api.post(
    `${EquipoRetiradoComplete.ENDPOINT}/${id}/restaurar`,
  );
  return data;
};
