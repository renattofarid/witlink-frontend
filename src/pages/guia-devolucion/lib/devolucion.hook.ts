import { useQuery } from "@tanstack/react-query";

import { GuiaDevolucionComplete } from "./devolucion.constants";

export const useGuiaDevolucionQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [GuiaDevolucionComplete.QUERY_KEY, params],
    // queryFn: () => getGuias(params),
    refetchOnWindowFocus: true,
  });
};

export const useProveedoresQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["proveedores", apiParams],
    // queryFn: () => getProveedores(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useSeriesQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["series", apiParams],
    // queryFn: () => getSeries(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};
