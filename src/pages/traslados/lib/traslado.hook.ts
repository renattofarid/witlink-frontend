import { useQuery } from "@tanstack/react-query";
import { getTraslados } from "./traslado.actions";
import { TrasladoComplete } from "./traslado.constants";
import { getSeries } from "@/pages/serie/lib/serie.actions";

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
