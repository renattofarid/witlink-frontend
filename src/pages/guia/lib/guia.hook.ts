import { useQuery } from "@tanstack/react-query";
import { getGuias } from "./guia.actions";
import { GuiaComplete } from "./guia.constants";

export const useGuiaQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [GuiaComplete.queryKey, params],
    queryFn: () => getGuias(params),
    refetchOnWindowFocus: true,
  });
};
