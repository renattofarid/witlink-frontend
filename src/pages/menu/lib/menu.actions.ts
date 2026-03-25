import { api } from "@/lib/config";
import { MenuComplete, OPCION_MENU_ENDPOINT } from "./menu.constants";
import type {
  MenuResponse,
  MenuResource,
  MenuBody,
  OpcionMenuResource,
  OpcionMenuBody,
} from "./menu.interface";

// Grupo Menus
export const getMenus = async (
  params: Record<string, string>
): Promise<MenuResponse> => {
  const { data } = await api.get(MenuComplete.ENDPOINT, { params });
  return data;
};

export const getMenu = async (id: number): Promise<MenuResource> => {
  const { data } = await api.get(`${MenuComplete.ENDPOINT}/${id}`);
  return data;
};

export const createMenu = async (body: MenuBody) => {
  const { data } = await api.post(MenuComplete.ENDPOINT, body);
  return data;
};

export const updateMenu = async (id: number, body: MenuBody) => {
  const { data } = await api.put(`${MenuComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteMenu = async (id: number) => {
  const { data } = await api.delete(`${MenuComplete.ENDPOINT}/${id}`);
  return data;
};

export const restoreMenu = async (id: number) => {
  const { data } = await api.post(`${MenuComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};

// Opciones Menu
export const getOpcionesMenu = async (
  grupoMenuId: number
): Promise<OpcionMenuResource[]> => {
  const { data } = await api.get(
    `${MenuComplete.ENDPOINT}/${grupoMenuId}/opciones-menu`
  );
  return data;
};

export const getOpcionesMenuAll = async (): Promise<OpcionMenuResource[]> => {
  const { data } = await api.get(OPCION_MENU_ENDPOINT, { params: { all: "true" } });
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createOpcionMenu = async (body: OpcionMenuBody) => {
  const { data } = await api.post(OPCION_MENU_ENDPOINT, body);
  return data;
};

export const updateOpcionMenu = async (id: number, body: OpcionMenuBody) => {
  const { data } = await api.put(`${OPCION_MENU_ENDPOINT}/${id}`, body);
  return data;
};

export const deleteOpcionMenu = async (id: number) => {
  const { data } = await api.delete(`${OPCION_MENU_ENDPOINT}/${id}`);
  return data;
};

export const restoreOpcionMenu = async (id: number) => {
  const { data } = await api.post(`${OPCION_MENU_ENDPOINT}/${id}/restaurar`);
  return data;
};
