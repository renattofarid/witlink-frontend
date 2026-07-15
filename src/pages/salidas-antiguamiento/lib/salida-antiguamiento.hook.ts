import { useQuery } from "@tanstack/react-query";
import { getSalidasAntiguamiento } from "./salida-antiguamiento.actions";
import { SalidaAntiguamientoComplete } from "./salida-antiguamiento.constants";

export const useSalidaAntiguamientoQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [SalidaAntiguamientoComplete.QUERY_KEY, params],
    queryFn: () => getSalidasAntiguamiento(params),
    refetchOnWindowFocus: true,
    enabled: true,
  });
};
