import { useQuery } from "@tanstack/react-query";
import { getTiposUsuario, getTipoUsuarioOpcionesMenu } from "./tipo-usuario.actions";
import { TipoUsuarioComplete } from "./tipo-usuario.constants";

export const useTipoUsuarioQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [TipoUsuarioComplete.QUERY_KEY, params],
    queryFn: () => getTiposUsuario(params),
    refetchOnWindowFocus: true,
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
