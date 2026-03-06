import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "./usuarios.actions";
import { UsuariosComplete } from "./usuarios.constants";

export const useUsuariosQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [UsuariosComplete.QUERY_KEY, params],
    queryFn: () => getUsuarios(params),
    refetchOnWindowFocus: true,
  });
};
