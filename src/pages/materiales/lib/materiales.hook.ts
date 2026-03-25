import { useQuery } from "@tanstack/react-query";
import { getMateriales } from "./materiales.actions";
import { MaterialesComplete } from "./materiales.constants";
import { api } from "@/lib/config";
import { ProductoComplete } from "@/pages/producto/lib/producto.constants";
import type { ProductoResponse } from "@/pages/producto/lib/producto.interface";

export const useMaterialesQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [MaterialesComplete.QUERY_KEY, params],
    queryFn: () => getMateriales(params),
    refetchOnWindowFocus: true,
  });
};

export const useProductosAsyncQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["productos-async", apiParams],
    queryFn: async (): Promise<ProductoResponse> => {
      const { data } = await api.get(ProductoComplete.ENDPOINT, { params: apiParams });
      return data;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
};
