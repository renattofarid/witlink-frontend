import { useQuery } from "@tanstack/react-query";
import { getCuadrillas } from "./cuadrilla.actions";
import { CuadrillaComplete } from "./cuadrilla.constants";

export const useCuadrillaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [CuadrillaComplete.queryKey, params],
    queryFn: () => getCuadrillas(params),
    refetchOnWindowFocus: true,
  });
};
