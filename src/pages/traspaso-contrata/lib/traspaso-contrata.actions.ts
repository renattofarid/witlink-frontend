import { api } from "@/lib/config";
import { TraspasoContrataComplete } from "./traspaso-contrata.constants";
import type { PuntoPartidaTraslado } from "./traspaso-contrata.interface";
import type {
  TraspasoContrataCreateBody,
  TraspasoContrataResource,
  TraspasoContrataResponse,
} from "./traspaso-contrata.interface";

export const getPuntosPartidaTraslado = async (): Promise<PuntoPartidaTraslado[]> => {
  const { data } = await api.get("/guias-salida/puntos-partida-traslado");
  return data.data;
};

export const createPuntoPartidaTraslado = async (descripcion: string) => {
  const { data } = await api.post("/guias-salida/puntos-partida-traslado", { descripcion });
  return data.data as PuntoPartidaTraslado;
};

export const updatePuntoPartidaTraslado = async (id: number, descripcion: string) => {
  const { data } = await api.put(`/guias-salida/puntos-partida-traslado/${id}`, { descripcion });
  return data.data as PuntoPartidaTraslado;
};

export const deletePuntoPartidaTraslado = async (id: number) => {
  await api.delete(`/guias-salida/puntos-partida-traslado/${id}`);
};

export const getTraspasosContrata = async (
  params: Record<string, string>,
): Promise<TraspasoContrataResponse> => {
  const { data } = await api.get(TraspasoContrataComplete.ENDPOINT, {
    params,
  });
  return data;
};

export const getTraspasoContrata = async (
  id: number,
): Promise<TraspasoContrataResource> => {
  const { data } = await api.get(
    `${TraspasoContrataComplete.ENDPOINT}/${id}`,
  );
  return data;
};

export const getSeriesDisponiblesTraspasoContrata = async (
  params?: Record<string, any>,
) => {
  const { data } = await api.get(
    `${TraspasoContrataComplete.ENDPOINT}/series-disponibles`,
    { params },
  );
  return data;
};

export const createTraspasoContrata = async (
  body: TraspasoContrataCreateBody,
): Promise<TraspasoContrataResource> => {
  const { data } = await api.post(TraspasoContrataComplete.ENDPOINT, body);
  return data;
};

export const updateTraspasoContrata = async (
  id: number,
  body: TraspasoContrataCreateBody,
): Promise<TraspasoContrataResource> => {
  const { data } = await api.put(
    `${TraspasoContrataComplete.ENDPOINT}/${id}`,
    body,
  );
  return data;
};

export const descargarGuiaTraspasoContrata = async (
  traspaso: Pick<TraspasoContrataResource, "id" | "numero">,
): Promise<void> => {
  const response = await api.get(
    `${TraspasoContrataComplete.ENDPOINT}/${traspaso.id}/pdf`,
    {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    },
  );
  const disposition = String(response.headers["content-disposition"] ?? "");
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const fileName = encodedName
    ? decodeURIComponent(encodedName)
    : plainName || `guia_traspaso_${traspaso.numero || traspaso.id}.pdf`;
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const subirDocumentoFirmadoTraspaso = async (
  id: number,
  archivo: File,
): Promise<TraspasoContrataResource> => {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const { data } = await api.post(
    `${TraspasoContrataComplete.ENDPOINT}/${id}/documento-firmado`,
    formData,
  );
  return data;
};

export const descargarDocumentoFirmadoTraspaso = async (
  traspaso: Pick<TraspasoContrataResource, "id" | "numero" | "documento_firmado">,
): Promise<void> => {
  const response = await api.get(
    `${TraspasoContrataComplete.ENDPOINT}/${traspaso.id}/documento-firmado`,
    { responseType: "blob" },
  );
  const disposition = String(response.headers["content-disposition"] ?? "");
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const extension = traspaso.documento_firmado?.extension || "pdf";
  const fileName = encodedName
    ? decodeURIComponent(encodedName)
    : plainName || `guia_traspaso_${traspaso.numero}_firmado.${extension}`;
  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
