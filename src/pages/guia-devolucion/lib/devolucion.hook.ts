import { useQuery } from "@tanstack/react-query";

import { GuiaDevolucionComplete } from "./devolucion.constants";
import {
  getGuiasDevolucion,
  getGuiaDevolucion,
  getDestinosDevolucion,
  getSeriesRetiradas,
} from "./devolucion.actions";
import type { SeriesRetiradasParams } from "./devolucion.interface";

export const useGuiaDevolucionQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [GuiaDevolucionComplete.QUERY_KEY, "list", params],
    queryFn: () => getGuiasDevolucion(params),
    refetchOnWindowFocus: true,
  });
};

export const useGuiaDevolucionDetailQuery = (id: number | null) => {
  return useQuery({
    queryKey: [GuiaDevolucionComplete.QUERY_KEY, "detail", id],
    queryFn: () => getGuiaDevolucion(id!),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  });
};

export const useDestinosDevolucionQuery = () => {
  return useQuery({
    queryKey: [GuiaDevolucionComplete.QUERY_KEY, "destinos"],
    queryFn: getDestinosDevolucion,
    refetchOnWindowFocus: false,
  });
};

export const useSeriesRetiradasQuery = (params: SeriesRetiradasParams) => {
  const hasFilter = Boolean(
    params.search?.trim() || params.sot?.trim() || params.despacho_id,
  );
  return useQuery({
    queryKey: [GuiaDevolucionComplete.QUERY_KEY, "series-retiradas", params],
    queryFn: () => getSeriesRetiradas(params),
    enabled: hasFilter,
    refetchOnWindowFocus: false,
  });
};
