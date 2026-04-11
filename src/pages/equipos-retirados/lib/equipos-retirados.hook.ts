import { useQuery } from "@tanstack/react-query";
import {
  getEquiposRetirados,
  getEquipoRetirado,
  getSeriesDisponibles,
} from "./equipos-retirados.actions";
import { EquiposRetiradosComplete } from "./equipos-retirados.constants";

export const useEquiposRetiradosQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [EquiposRetiradosComplete.QUERY_KEY, params],
    queryFn: () => getEquiposRetirados(params),
    refetchOnWindowFocus: true,
  });
};

export const useEquipoRetiradoDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: [EquiposRetiradosComplete.QUERY_KEY, "detail", id],
    queryFn: () => getEquipoRetirado(id!),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });
};

export const useSeriesDisponiblesQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["series-disponibles-retiro", apiParams],
    queryFn: () => getSeriesDisponibles(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};
