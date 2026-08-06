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

export const createTraspasoContrata = async (
  body: TraspasoContrataCreateBody,
): Promise<TraspasoContrataResource> => {
  const { data } = await api.post(TraspasoContrataComplete.ENDPOINT, body);
  return data;
};
