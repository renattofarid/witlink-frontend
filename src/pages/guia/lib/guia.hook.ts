import { useQuery } from "@tanstack/react-query";
import {
  getGuias,
  getProveedores,
  getSeries,
} from "./guia.actions";
import { GuiaComplete } from "./guia.constants";

export const useGuiaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, params],
    queryFn: () => getGuias(params),
    refetchOnWindowFocus: true,
  });
};

export const useProveedoresQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["proveedores", apiParams],
    queryFn: () => getProveedores(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useSeriesQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["series", apiParams],
    queryFn: () => getSeries(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};
