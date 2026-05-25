import { useQuery } from "@tanstack/react-query";
import {
  getLiquidaciones,
  searchSot,
  getInventarioTecnicoLiquidacion,
} from "./liquidaciones.actions";
import { LiquidacionesComplete } from "./liquidaciones.constants";
import { getPersonas } from "@/pages/persona/lib/persona.actions";

export const useLiquidacionesForSelectQuery = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  enabled?: boolean;
  [key: string]: any;
}) => {
  const { enabled = true, search, page, per_page } = params;
  const apiParams: Record<string, string> = {
    page: String(page ?? 1),
    per_page: String(per_page ?? 10),
  };
  if (search) apiParams.search = search;

  return useQuery({
    queryKey: [LiquidacionesComplete.QUERY_KEY, "select", apiParams],
    queryFn: () => getLiquidaciones(apiParams),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useLiquidacionesQuery = (params: Record<string, string>) => {
  return useQuery({
    queryKey: [LiquidacionesComplete.QUERY_KEY, params],
    queryFn: () => getLiquidaciones(params),
    refetchOnWindowFocus: true,
  });
};

export const useSotSearchQuery = (sot: string | null) => {
  return useQuery({
    queryKey: ["liquidacion-sot", sot],
    queryFn: () => searchSot(sot!),
    enabled: !!sot,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useTecnicosLiquidacionQuery = (
  params: Record<string, any> = {},
) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["personas-tecnicos-liquidacion", apiParams],
    queryFn: () =>
      getPersonas({
        tipo_empleado: "Técnico",
        ...apiParams,
      } as Record<string, string | undefined>),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useInventarioTecnicoLiquidacionQuery = (
  tecnicoId: string | null,
) => {
  return useQuery({
    queryKey: ["inventario-tecnico-liquidacion", tecnicoId],
    queryFn: () => getInventarioTecnicoLiquidacion(Number(tecnicoId)),
    enabled: !!tecnicoId,
    refetchOnWindowFocus: false,
  });
};
