import { useQuery } from "@tanstack/react-query";
import { getProductos } from "./producto.actions";
import { ProductoComplete } from "./producto.constants";

export const useProductoQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [ProductoComplete.QUERY_KEY, params],
    queryFn: () => getProductos(params),
    refetchOnWindowFocus: true,
  });
};
