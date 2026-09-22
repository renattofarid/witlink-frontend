import { api } from "@/lib/config";
import type {
  CambiarUbicacionMasivoBody,
  CambiarUbicacionMasivoResponse,
  CorporativoInventarioMaterialResponse,
  CorporativoInventarioSerieResponse,
  ReservaSotBody,
  ReservaSotMasivoBody,
  ReservaSotMasivoResponse,
} from "./corporativo.interface";

function buildSeriesBody(params: Record<string, string>) {
  const { almacen_id, productos, page, per_page, ...rest } = params;
  const body: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (value !== "") body[key] = value;
  }

  if (page) body.page = Number(page);
  if (per_page) body.per_page = Number(per_page);
  if (almacen_id) body.almacen_id = almacen_id.split(",").filter(Boolean);
  if (productos) body.productos = productos.split(",").filter(Boolean);

  return body;
}

export const getInventarioSeriesCorporativo = async (
  params: Record<string, string>,
): Promise<CorporativoInventarioSerieResponse> => {
  const { data } = await api.post(
    "/corporativo/inventarios/series",
    buildSeriesBody(params),
  );
  return data;
};

export const getInventarioMaterialesCorporativo = async (
  params: Record<string, string>,
): Promise<CorporativoInventarioMaterialResponse> => {
  const { data } = await api.post(
    "/corporativo/inventarios/materiales",
    buildSeriesBody(params),
  );
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

export const liberarMaterialSot = async (
  materialId: number,
  almacenId: number,
  numeroSot?: string | null,
  reservaId?: number,
) => {
  const { data } = await api.delete(
    `/corporativo/inventarios/material/${materialId}/sot`,
    {
      params: {
        almacen_id: almacenId,
        ...(numeroSot ? { numero_sot: numeroSot } : {}),
        ...(reservaId ? { reserva_id: reservaId } : {}),
      },
    },
  );
  return data;
};

export const reservarSotMasivo = async (
  body: ReservaSotMasivoBody,
): Promise<ReservaSotMasivoResponse> => {
  const { data } = await api.post(
    "/corporativo/inventarios/series/reservar-sot-masivo",
    body,
  );
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
