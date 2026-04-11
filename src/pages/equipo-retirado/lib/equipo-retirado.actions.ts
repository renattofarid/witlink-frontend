import { api } from "@/lib/config";
import { EquipoRetiradoComplete } from "./equipo-retirado.constants";
import type {
  EquipoRetiradoResponse,
  EquipoRetiradoResource,
  EquipoRetiradoCreateBody,
  EquipoRetiradoEditHeaderBody,
  AddProductosEquipoRetiradoBody,
  AddSeriesEquipoRetiradoBody,
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

export const createEquipoRetirado = async (body: EquipoRetiradoCreateBody) => {
  const { data } = await api.post(EquipoRetiradoComplete.ENDPOINT, body);
  return data;
};

export const updateEquipoRetirado = async (
  id: number,
  body: EquipoRetiradoEditHeaderBody,
) => {
  const { data } = await api.put(
    `${EquipoRetiradoComplete.ENDPOINT}/${id}`,
    body,
  );
  return data;
};

export const deleteEquipoRetirado = async (id: number) => {
  const { data } = await api.delete(
    `${EquipoRetiradoComplete.ENDPOINT}/${id}`,
  );
  return data;
};

export const restoreEquipoRetirado = async (id: number) => {
  const { data } = await api.post(
    `${EquipoRetiradoComplete.ENDPOINT}/${id}/restaurar`,
  );
  return data;
};

// ── Productos de equipo retirado ─────────────────────────────────────────────

export const addProductosEquipoRetirado = async (
  body: AddProductosEquipoRetiradoBody,
) => {
  const { data } = await api.post(
    "/productos-documento-equipo-retirado",
    body,
  );
  return data;
};

export const updateProductoEquipoRetirado = async (
  id: number,
  cantidad: number,
) => {
  const { data } = await api.put(
    `/productos-documento-equipo-retirado/${id}`,
    { cantidad },
  );
  return data;
};

export const deleteProductoEquipoRetirado = async (
  id: number,
  forzar?: boolean,
) => {
  const params = forzar ? { forzar: true } : undefined;
  const { data } = await api.delete(
    `/productos-documento-equipo-retirado/${id}`,
    { params },
  );
  return data;
};

// ── Series de equipo retirado ─────────────────────────────────────────────────

export const addSeriesEquipoRetirado = async (
  body: AddSeriesEquipoRetiradoBody,
) => {
  const { data } = await api.post(
    "/series-documento-equipo-retirado",
    body,
  );
  return data;
};

export const deleteSerieEquipoRetirado = async (
  serieId: number,
  detailProductId: number,
) => {
  const { data } = await api.delete(
    `/series-documento-equipo-retirado/${serieId}/${detailProductId}`,
  );
  return data;
};

// ── Helpers para dialogs ──────────────────────────────────────────────────────

export const getSeries = async (params: Record<string, any>) => {
  const { data } = await api.get("/series", { params });
  return data;
};
