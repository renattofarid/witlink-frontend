import { useQuery } from "@tanstack/react-query";
import { TraspasoContrataComplete } from "./traspaso-contrata.constants";
import {
  getTraspasosContrata,
  getTraspasoContrata,
  getSeriesDisponiblesTraspasoContrata,
} from "./traspaso-contrata.actions";

export const useTraspasoContrataQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [TraspasoContrataComplete.QUERY_KEY, "list", params],
    queryFn: () => getTraspasosContrata(params),
    refetchOnWindowFocus: true,
  });
};

export const useTraspasoContrataDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: [TraspasoContrataComplete.QUERY_KEY, "detail", id],
    queryFn: () => getTraspasoContrata(id!),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  });
};

export const useSeriesDisponiblesTraspasoContrataQuery = (
  params: Record<string, any> = {},
) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: [
      TraspasoContrataComplete.QUERY_KEY,
      "series-disponibles",
      apiParams,
    ],
    queryFn: () => getSeriesDisponiblesTraspasoContrata(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};
