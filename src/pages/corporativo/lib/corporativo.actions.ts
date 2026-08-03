import { api } from "@/lib/config";
import type {
  CambiarUbicacionMasivoBody,
  CambiarUbicacionMasivoResponse,
  CorporativoInventarioMaterialResponse,
  CorporativoInventarioSerieResponse,
  ReservaSotBody,
} from "./corporativo.interface";

export const getInventarioSeriesCorporativo = async (
  params: Record<string, string>,
): Promise<CorporativoInventarioSerieResponse> => {
  const { data } = await api.get("/corporativo/inventarios/series", { params });
  return data;
};

export const getInventarioMaterialesCorporativo = async (
  params: Record<string, string>,
): Promise<CorporativoInventarioMaterialResponse> => {
  const { data } = await api.get("/corporativo/inventarios/materiales", { params });
  return data;
};

export const reservarSerieSot = async (serieId: number, body: ReservaSotBody) => {
  const { data } = await api.patch(`/corporativo/inventarios/serie/${serieId}/sot`, body);
  return data;
};

export const liberarSerieSot = async (serieId: number) => {
  const { data } = await api.delete(`/corporativo/inventarios/serie/${serieId}/sot`);
  return data;
};

export const reservarMaterialSot = async (materialId: number, body: ReservaSotBody) => {
  const { data } = await api.patch(`/corporativo/inventarios/material/${materialId}/sot`, body);
  return data;
};

export const liberarMaterialSot = async (materialId: number) => {
  const { data } = await api.delete(`/corporativo/inventarios/material/${materialId}/sot`);
  return data;
};

export const cambiarUbicacionMasivo = async (
  body: CambiarUbicacionMasivoBody,
): Promise<CambiarUbicacionMasivoResponse> => {
  const { data } = await api.post("/inventarios/series/cambiar-ubicacion-masivo", body);
  return data;
};

export const getDiagnosticoReservasSot = async (): Promise<Blob> => {
  const { data } = await api.get("/inventarios/diagnostico/series-sot", {
    responseType: "blob",
  });
  return data;
};
