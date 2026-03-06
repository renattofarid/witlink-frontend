import { useQuery } from "@tanstack/react-query";
import { getOficinas } from "./oficina.actions";
import { OficinaComplete } from "./oficina.constants";

export const useOficinaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [OficinaComplete.QUERY_KEY, params],
    queryFn: () => getOficinas(params),
    refetchOnWindowFocus: true,
  });
};

export const useOficinaSelectQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["oficinas-select", params],
    queryFn: () => getOficinas(params as Record<string, string>),
    refetchOnWindowFocus: false,
  });
};
