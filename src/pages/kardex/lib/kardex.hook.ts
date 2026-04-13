import { useQuery } from "@tanstack/react-query";
import { getKardex } from "./kardex.actions";
import { KardexComplete } from "./kardex.constants";

export const useKardexQuery = (params: Record<string, string>) =>
  useQuery({
    queryKey: [KardexComplete.QUERY_KEY, params],
    queryFn: () => getKardex(params),
    refetchOnWindowFocus: true,
  });
