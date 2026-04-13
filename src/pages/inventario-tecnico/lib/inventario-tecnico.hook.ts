import { useQuery } from "@tanstack/react-query";
import { getInventarioTecnico } from "./inventario-tecnico.actions";
import { InventarioTecnicoComplete } from "./inventario-tecnico.constants";
import { getTecnicos } from "@/pages/tecnico/lib/tecnico.actions";

export const useInventarioTecnicoQuery = (
  tecnicoId: string,
  params: Record<string, string> = {},
) =>
  useQuery({
    queryKey: [InventarioTecnicoComplete.QUERY_KEY, tecnicoId, params],
    queryFn: () => getInventarioTecnico(Number(tecnicoId), params),
    enabled: !!tecnicoId,
    refetchOnWindowFocus: true,
  });

export const useTecnicoInventarioQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["tecnicos-inventario-tecnico", apiParams],
    queryFn: () => getTecnicos(apiParams as Record<string, string>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
