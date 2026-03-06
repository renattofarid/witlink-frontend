import { useQuery } from "@tanstack/react-query";
import { getTecnicos } from "./tecnico.actions";
import { TecnicoComplete } from "./tecnico.constants";
import { getCuadrillas } from "@/pages/cuadrilla/lib/cuadrilla.actions";
import { getPersonas } from "@/pages/persona/lib/persona.actions";

export const useTecnicoQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [TecnicoComplete.QUERY_KEY, params],
    queryFn: () => getTecnicos(params),
    refetchOnWindowFocus: true,
  });
};

export const useCuadrillaSelectQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["cuadrillas", params],
    queryFn: () => getCuadrillas(params as Record<string, string>),
    refetchOnWindowFocus: false,
  });
};

export const usePersonaSelectQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["personas", params],
    queryFn: () => getPersonas(params as Record<string, string>),
    refetchOnWindowFocus: false,
  });
};
