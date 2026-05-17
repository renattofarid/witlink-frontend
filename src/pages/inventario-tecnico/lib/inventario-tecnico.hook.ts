import { useQuery } from "@tanstack/react-query";
import { getInventarioTecnico } from "./inventario-tecnico.actions";
import { InventarioTecnicoComplete } from "./inventario-tecnico.constants";
import { getPersonas } from "@/pages/persona/lib/persona.actions";

export const useInventarioTecnicoQuery = (
  tecnicoId: string,
  params: Record<string, string> = {},
) =>
  useQuery({
    queryKey: [InventarioTecnicoComplete.QUERY_KEY, tecnicoId, params],
    queryFn: () => getInventarioTecnico(Number(tecnicoId), params),
    enabled: !!tecnicoId,
    refetchOnWindowFocus: true,
  });

export const useTecnicoInventarioQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["personas-tecnicos-inventario", apiParams],
    queryFn: () =>
      getPersonas({
        tipo_empleado: "Técnico",
        ...apiParams,
      } as Record<string, string | undefined>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
