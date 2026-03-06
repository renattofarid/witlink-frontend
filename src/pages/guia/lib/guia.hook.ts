import { useQuery } from "@tanstack/react-query";
import { getGuias, getProveedores, getProductos, getCategorias } from "./guia.actions";
import { GuiaComplete } from "./guia.constants";

export const useGuiaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [GuiaComplete.QUERY_KEY, params],
    queryFn: () => getGuias(params),
    refetchOnWindowFocus: true,
  });
};

export const useProveedoresQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["proveedores", params],
    queryFn: () => getProveedores(params),
    refetchOnWindowFocus: false,
  });
};

export const useProductosQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["productos", params],
    queryFn: () => getProductos(params),
    refetchOnWindowFocus: false,
  });
};

export const useCategoriasQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["categorias", params],
    queryFn: () => getCategorias(params),
    refetchOnWindowFocus: false,
  });
};
