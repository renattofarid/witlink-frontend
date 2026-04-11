import { useQuery } from "@tanstack/react-query";
import {
  getEquiposRetirados,
  getEquipoRetirado,
  getSeries,
} from "./equipo-retirado.actions";
import { EquipoRetiradoComplete } from "./equipo-retirado.constants";

export const useEquipoRetiradoQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [EquipoRetiradoComplete.QUERY_KEY, params],
    queryFn: () => getEquiposRetirados(params),
    refetchOnWindowFocus: true,
  });

export const useEquipoRetiradoDetailQuery = (id: number | null) =>
  useQuery({
    queryKey: [EquipoRetiradoComplete.QUERY_KEY, "detail", id],
    queryFn: () => getEquipoRetirado(id!),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

export const useSeriesERQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["series-er", apiParams],
    queryFn: () => getSeries(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};
