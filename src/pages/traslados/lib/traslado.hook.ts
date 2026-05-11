import { useQuery } from "@tanstack/react-query";
import { getTraslados, getTrasladoList } from "./traslado.actions";
import { TrasladoComplete } from "./traslado.constants";
import { getSeries } from "@/pages/serie/lib/serie.actions";
import { getMateriales } from "@/pages/materiales/lib/materiales.actions";

export const useTrasladoQuery = (serieId: number | null) =>
  useQuery({
    queryKey: [TrasladoComplete.QUERY_KEY, serieId],
    queryFn: () => getTraslados(serieId!),
    enabled: serieId !== null,
    refetchOnWindowFocus: true,
  });

export const useSeriesTrasladoQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["series-traslado", apiParams],
    queryFn: () => getSeries(apiParams as Record<string, string>),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useMaterialesTrasladoQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["materiales-traslado", apiParams],
    queryFn: () => getMateriales(apiParams as Record<string, string>),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useTrasladoListQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [TrasladoComplete.QUERY_KEY, "list", params],
    queryFn: () => getTrasladoList(params),
    refetchOnWindowFocus: true,
  });
