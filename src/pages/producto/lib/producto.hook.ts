import { useQuery } from "@tanstack/react-query";
import { getProductos } from "./producto.actions";
import { ProductoComplete } from "./producto.constants";
import { getCategorias } from "@/pages/categoria/lib/categoria.actions";

export const useProductoQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [ProductoComplete.QUERY_KEY, params],
    queryFn: () => getProductos(params),
    refetchOnWindowFocus: true,
  });
};

export const useCategoriasAsyncQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["categorias", params],
    queryFn: () => getCategorias(params),
    refetchOnWindowFocus: false,
  });
};
