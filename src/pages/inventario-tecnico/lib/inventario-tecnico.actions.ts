import { api } from "@/lib/config";
import type {
  InventarioTecnicoResource,
  DevolverMaterialBody,
} from "./inventario-tecnico.interface";

export const getInventarioTecnico = async (
  tecnicoId: number,
  params: Record<string, string> = {},
): Promise<InventarioTecnicoResource[]> => {
  const { data } = await api.get(`/tecnicos/${tecnicoId}/inventario`, { params });
  return data;
};

export const devolverMaterial = async (
  tecnicoId: number,
  inventarioId: number,
  body: DevolverMaterialBody,
) => {
  const { data } = await api.post(
    `/tecnicos/${tecnicoId}/inventario/${inventarioId}/devolverMaterial`,
    body,
  );
  return data;
};

export const devolverSerie = async (
  tecnicoId: number,
  inventarioId: number,
) => {
  const { data } = await api.post(
    `/tecnicos/${tecnicoId}/inventario/${inventarioId}/devolerSerie`,
  );
  return data;
};

export const generarCarga = async (tecnicoId: number): Promise<Blob> => {
  const { data } = await api.get(`/tecnicos/${tecnicoId}/generar-carga`, {
    responseType: "blob",
  });
  return data;
};
