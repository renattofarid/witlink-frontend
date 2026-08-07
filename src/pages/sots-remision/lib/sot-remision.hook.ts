import { useQuery } from "@tanstack/react-query";
import { getSotsRemision, getSotRemision } from "./sot-remision.actions";
import { SotRemisionComplete } from "./sot-remision.constants";

export const useSotsRemisionQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [SotRemisionComplete.QUERY_KEY, params],
    queryFn: () => getSotsRemision(params),
  });
};

/**
 * Consulta puntual de una SOT — usada, por ejemplo, para previsualizar el
 * destinatario/dirección/RUC antes de generar la guía de despacho.
 */
export const useSotRemisionQuery = (sot: string, enabled = true) => {
  return useQuery({
    queryKey: [SotRemisionComplete.QUERY_KEY, "detalle", sot],
    queryFn: () => getSotRemision(sot),
    enabled: enabled && sot.trim().length > 0,
    retry: false,
  });
};
