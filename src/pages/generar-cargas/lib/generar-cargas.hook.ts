import { useQuery } from "@tanstack/react-query";
import { getFavoritosTecnicos } from "./generar-cargas.actions";
import { GenerarCargasComplete } from "./generar-cargas.constants";

export const useFavoritosTecnicosQuery = (
  params: Record<string, string | undefined>,
) =>
  useQuery({
    queryKey: [GenerarCargasComplete.QUERY_KEY, params],
    queryFn: () => getFavoritosTecnicos(params),
    refetchOnWindowFocus: true,
  });
