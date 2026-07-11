import { useQuery } from "@tanstack/react-query";
import { getDesasignaciones } from "./desasignacion.actions";
import { DesasignacionComplete } from "./desasignacion.constants";
import { getPersonas } from "@/pages/persona/lib/persona.actions";

export const useDesasignacionQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [DesasignacionComplete.QUERY_KEY, params],
    queryFn: () => getDesasignaciones(params),
    refetchOnWindowFocus: true,
    enabled: true,
  });
};

export const useTecnicoDesasignacionQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["personas-tecnicos-desasignacion", apiParams],
    queryFn: () =>
      getPersonas({
        ...apiParams,
      } as Record<string, string | undefined>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
