import { useQuery } from "@tanstack/react-query";
import { getDespachos } from "./despacho.actions";
import { DespachoComplete } from "./despacho.constants";
import { getTecnicos } from "@/pages/tecnico/lib/tecnico.actions";

export const useDespachoQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, params],
    queryFn: () => getDespachos(params),
    refetchOnWindowFocus: true,
    enabled: !!params.tecnico_id,
  });
};

export const useTecnicoDespachoQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["tecnicos-despacho", apiParams],
    queryFn: () => getTecnicos(apiParams as Record<string, string>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
