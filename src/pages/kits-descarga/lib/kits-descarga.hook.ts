import { useQuery } from "@tanstack/react-query";
import { getCategoriasAll, getKits, getTiposTrabajoAll } from "./kits-descarga.actions";
import { KitsDescargaComplete } from "./kits-descarga.constants";

export const useKitsQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [KitsDescargaComplete.QUERY_KEY, params],
    queryFn: () => getKits(params),
    refetchOnWindowFocus: true,
  });

export const useCategoriasAllQuery = () =>
  useQuery({ queryKey: ["categorias-trabajo", "all"], queryFn: getCategoriasAll, refetchOnWindowFocus: true });

export const useTiposTrabajoAllQuery = () =>
  useQuery({ queryKey: ["tipos-trabajo", "all"], queryFn: getTiposTrabajoAll, refetchOnWindowFocus: true });

