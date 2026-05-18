import { useQuery } from "@tanstack/react-query";
import { getDespachos, getSeriesDisponibles } from "./despacho.actions";
import { DespachoComplete } from "./despacho.constants";
import { getPersonas } from "@/pages/persona/lib/persona.actions";

export const useDespachoQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [DespachoComplete.QUERY_KEY, params],
    queryFn: () => getDespachos(params),
    refetchOnWindowFocus: true,
    enabled: true,
  });
};

export const useSeriesDisponiblesDespachoQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["series-disponibles-despacho", apiParams],
    queryFn: () => getSeriesDisponibles(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useTecnicoDespachoQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["personas-tecnicos-despacho", apiParams],
    queryFn: () =>
      getPersonas({
        tipo_empleado: "Técnico",
        ...apiParams,
      } as Record<string, string | undefined>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
