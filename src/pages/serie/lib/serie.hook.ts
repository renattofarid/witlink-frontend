import { useQuery } from "@tanstack/react-query";
import { getSeries } from "./serie.actions";
import { SerieComplete } from "./serie.constants";
import { getProductosAll } from "@/pages/producto/lib/producto.actions";

export const useSerieQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [SerieComplete.QUERY_KEY, params],
    queryFn: () => getSeries(params),
    refetchOnWindowFocus: true,
  });
};

export const useProductosAllQuery = () => {
  return useQuery({
    queryKey: ["productos-all"],
    queryFn: () => getProductosAll(),
    refetchOnWindowFocus: false,
  });
};

export const useAllEquipos = () => {
  return useQuery({
    queryKey: ["productos-all-equipos"],
    queryFn: () => getProductosAll({ tipo: "equipo" }),
    refetchOnWindowFocus: false,
  });
};
