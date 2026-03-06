import { useQuery } from "@tanstack/react-query";
import { getCategorias } from "./categoria.actions";
import { CategoriaComplete } from "./categoria.constants";

export const useCategoriaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [CategoriaComplete.QUERY_KEY, params],
    queryFn: () => getCategorias(params),
    refetchOnWindowFocus: true,
  });
};
