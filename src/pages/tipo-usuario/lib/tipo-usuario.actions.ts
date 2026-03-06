import { api } from "@/lib/config";
import { TipoUsuarioComplete } from "./tipo-usuario.constants";
import type {
  TipoUsuarioResponse,
  TipoUsuarioResource,
  TipoUsuarioBody,
  OpcionMenuResource,
  OpcionMenuWithGrupo,
  PermisoBody,
} from "./tipo-usuario.interface";

export const getTiposUsuario = async (
  params: Record<string, string>
): Promise<TipoUsuarioResponse> => {
  const { data } = await api.get(TipoUsuarioComplete.ENDPOINT, { params });
  return data;
};

export const getTipoUsuario = async (id: number): Promise<TipoUsuarioResource> => {
  const { data } = await api.get(`${TipoUsuarioComplete.ENDPOINT}/${id}`);
  return data;
};

export const createTipoUsuario = async (body: TipoUsuarioBody) => {
  const { data } = await api.post(TipoUsuarioComplete.ENDPOINT, body);
  return data;
};

export const updateTipoUsuario = async (id: number, body: TipoUsuarioBody) => {
  const { data } = await api.put(`${TipoUsuarioComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteTipoUsuario = async (id: number) => {
  const { data } = await api.delete(`${TipoUsuarioComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreTipoUsuario = async (id: number) => {
  const { data } = await api.post(`${TipoUsuarioComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};

export const getTipoUsuarioOpcionesMenu = async (id: number): Promise<OpcionMenuResource[]> => {
  const { data } = await api.get(`${TipoUsuarioComplete.ENDPOINT}/${id}/opciones-menu`);
  return data;
};

export const getAllOpcionesMenu = async (): Promise<OpcionMenuWithGrupo[]> => {
  const { data } = await api.get("/opciones-menu");
  return data;
};

export const addPermiso = async (body: PermisoBody) => {
  const { data } = await api.post("/permisos-tipo-usuario", body);
  return data;
};

export const deletePermiso = async (body: PermisoBody) => {
  const { data } = await api.delete("/permisos-tipo-usuario", { data: body });
  return data;
};
