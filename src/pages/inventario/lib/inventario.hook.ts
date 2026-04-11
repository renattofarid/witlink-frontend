import { useQuery } from "@tanstack/react-query";
import { getInventarioSeries, getInventarioMateriales } from "./inventario.actions";
import {
  INVENTARIO_SERIES_QUERY_KEY,
  INVENTARIO_MATERIALES_QUERY_KEY,
} from "./inventario.constants";

export const useInventarioSeriesQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [INVENTARIO_SERIES_QUERY_KEY, params],
    queryFn: () => getInventarioSeries(params),
    refetchOnWindowFocus: true,
  });

export const useInventarioMaterialesQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [INVENTARIO_MATERIALES_QUERY_KEY, params],
    queryFn: () => getInventarioMateriales(params),
    refetchOnWindowFocus: true,
  });
