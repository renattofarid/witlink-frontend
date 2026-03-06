import { useQuery } from "@tanstack/react-query";
import {
  getTiposUsuario,
  getTipoUsuarioOpcionesMenu,
  getAllOpcionesMenu,
} from "./tipo-usuario.actions";
import { TipoUsuarioComplete } from "./tipo-usuario.constants";

export const useTipoUsuarioQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [TipoUsuarioComplete.QUERY_KEY, params],
    queryFn: () => getTiposUsuario(params),
    refetchOnWindowFocus: true,
  });
};

export const useTipoUsuarioSelectQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["tipo-usuario-select", params],
    queryFn: () => getTiposUsuario(params as Record<string, string>),
    refetchOnWindowFocus: false,
  });
};

export const useTipoUsuarioOpcionesMenuQuery = (id: number | null) => {
  return useQuery({
    queryKey: [TipoUsuarioComplete.QUERY_KEY, "opciones-menu", id],
    queryFn: () => getTipoUsuarioOpcionesMenu(id!),
    enabled: id !== null,
    refetchOnWindowFocus: true,
  });
};

export const useAllOpcionesMenuQuery = () => {
  return useQuery({
    queryKey: ["all-opciones-menu"],
    queryFn: getAllOpcionesMenu,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
