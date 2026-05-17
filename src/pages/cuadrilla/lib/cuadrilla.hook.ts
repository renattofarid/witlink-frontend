import { useQuery } from "@tanstack/react-query";
import { getCuadrillas } from "./cuadrilla.actions";
import { CuadrillaComplete } from "./cuadrilla.constants";

export const useCuadrillaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [CuadrillaComplete.QUERY_KEY, params],
    queryFn: () => getCuadrillas(params),
    refetchOnWindowFocus: true,
  });
};

export const useCuadrillaSelectQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["cuadrillas-select", apiParams],
    queryFn: () => getCuadrillas(apiParams as Record<string, string>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
