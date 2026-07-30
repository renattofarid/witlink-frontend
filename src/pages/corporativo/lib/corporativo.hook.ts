import { useQuery } from "@tanstack/react-query";
import {
  getInventarioMaterialesCorporativo,
  getInventarioSeriesCorporativo,
} from "./corporativo.actions";
import {
  INVENTARIO_MATERIALES_QUERY_KEY,
  INVENTARIO_SERIES_QUERY_KEY,
} from "@/pages/inventario/lib/inventario.constants";

export const useInventarioSeriesCorporativoQuery = (
  params: Record<string, string>,
  enabled = true,
) =>
  useQuery({
    queryKey: [INVENTARIO_SERIES_QUERY_KEY, "corporativo", params],
    queryFn: () => getInventarioSeriesCorporativo(params),
    enabled: enabled && !!params.almacen_id,
    refetchOnWindowFocus: true,
  });

export const useInventarioMaterialesCorporativoQuery = (
  params: Record<string, string>,
  enabled = true,
) =>
  useQuery({
    queryKey: [INVENTARIO_MATERIALES_QUERY_KEY, "corporativo", params],
    queryFn: () => getInventarioMaterialesCorporativo(params),
    enabled,
    refetchOnWindowFocus: true,
  });
