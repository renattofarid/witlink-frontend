import { api } from "@/lib/config";
import { TraspasoContrataComplete } from "./traspaso-contrata.constants";
import type {
  TraspasoContrataCreateBody,
  TraspasoContrataResource,
  TraspasoContrataResponse,
} from "./traspaso-contrata.interface";

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
