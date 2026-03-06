import { api } from "@/lib/config";
import { UsuariosComplete } from "./usuarios.constants";
import type {
  UsuariosResponse,
  UsuariosResource,
  UsuariosCreateBody,
  UsuariosEditBody,
} from "./usuarios.interface";

export const getUsuarios = async (
  params: Record<string, string>
): Promise<UsuariosResponse> => {
  const { data } = await api.get(UsuariosComplete.ENDPOINT, { params });
  return data;
};

export const getUsuario = async (id: number): Promise<UsuariosResource> => {
  const { data } = await api.get(`${UsuariosComplete.ENDPOINT}/${id}`);
  return data;
};

export const createUsuario = async (body: UsuariosCreateBody) => {
  const { data } = await api.post(UsuariosComplete.ENDPOINT, body);
  return data;
};

export const updateUsuario = async (id: number, body: UsuariosEditBody) => {
  const { data } = await api.put(`${UsuariosComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteUsuario = async (id: number) => {
  const { data } = await api.delete(`${UsuariosComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreUsuario = async (id: number) => {
  const { data } = await api.post(
    `${UsuariosComplete.ENDPOINT}/${id}/restaurar`
  );
  return data;
};
