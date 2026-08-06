import { useQuery } from "@tanstack/react-query";
import { TraspasoContrataComplete } from "./traspaso-contrata.constants";
import { getTraspasosContrata, getTraspasoContrata } from "./traspaso-contrata.actions";

export const useTraspasoContrataQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [TraspasoContrataComplete.QUERY_KEY, "list", params],
    queryFn: () => getTraspasosContrata(params),
    refetchOnWindowFocus: true,
  });
};

export const useTraspasoContrataDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: [TraspasoContrataComplete.QUERY_KEY, "detail", id],
    queryFn: () => getTraspasoContrata(id!),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  });
};
