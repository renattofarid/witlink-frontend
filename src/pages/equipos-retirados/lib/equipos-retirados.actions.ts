import { api } from "@/lib/config";
import { EquiposRetiradosComplete } from "./equipos-retirados.constants";
import type {
  EquiposRetiradosResponse,
  EquipoRetiradoResource,
  EquipoRetiradoCreateBody,
  EquipoRetiradoEditBody,
  AddProductosEquipoRetiradoBody,
  AddSeriesEquipoRetiradoBody,
} from "./equipos-retirados.interface";

export const getEquiposRetirados = async (
  params: Record<string, string>,
): Promise<EquiposRetiradosResponse> => {
  const { data } = await api.get(EquiposRetiradosComplete.ENDPOINT, { params });
  return data;
};

export const getEquipoRetirado = async (
  id: number,
): Promise<EquipoRetiradoResource> => {
  const { data } = await api.get(`${EquiposRetiradosComplete.ENDPOINT}/${id}`);
  return data;
};

export const createEquipoRetirado = async (body: EquipoRetiradoCreateBody) => {
  const { data } = await api.post(EquiposRetiradosComplete.ENDPOINT, body);
  return data;
};

export const updateEquipoRetirado = async (
  id: number,
  body: EquipoRetiradoEditBody,
) => {
  const { data } = await api.put(
    `${EquiposRetiradosComplete.ENDPOINT}/${id}`,
    body,
  );
  return data;
};

export const deleteEquipoRetirado = async (id: number) => {
  const { data } = await api.delete(
    `${EquiposRetiradosComplete.ENDPOINT}/${id}`,
  );
  return data;
};

export const restoreEquipoRetirado = async (id: number) => {
  const { data } = await api.post(
    `${EquiposRetiradosComplete.ENDPOINT}/${id}/restaurar`,
  );
  return data;
};

// ── Productos ─────────────────────────────────────────────────────────────────

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

// ── Series ────────────────────────────────────────────────────────────────────

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

// ── Helper ────────────────────────────────────────────────────────────────────

export const getSeriesDisponibles = async (params: Record<string, any>) => {
  const { data } = await api.get("/series", { params });
  return data;
};
