import { useQuery } from "@tanstack/react-query";
import { getInventarioSeries, getInventarioMateriales, getSerieHistorial } from "./inventario.actions";
import {
  INVENTARIO_SERIES_QUERY_KEY,
  INVENTARIO_MATERIALES_QUERY_KEY,
} from "./inventario.constants";

export const useInventarioSeriesQuery = (
  params: Record<string, string>,
  enabled = true,
) =>
  useQuery({
    queryKey: [INVENTARIO_SERIES_QUERY_KEY, params],
    queryFn: () => getInventarioSeries(params),
    enabled,
    refetchOnWindowFocus: true,
  });

export const useInventarioMaterialesQuery = (
  params: Record<string, string>,
  enabled = true,
) =>
  useQuery({
    queryKey: [INVENTARIO_MATERIALES_QUERY_KEY, params],
    queryFn: () => getInventarioMateriales(params),
    enabled,
    refetchOnWindowFocus: true,
  });

export const useSerieHistorialQuery = (serieId: number | null) =>
  useQuery({
    queryKey: ["serie-historial", serieId],
    queryFn: () => getSerieHistorial(serieId!),
    enabled: serieId !== null,
    refetchOnWindowFocus: true,
  });
