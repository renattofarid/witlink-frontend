import { useQuery } from "@tanstack/react-query";
import { getPersona, getPersonas } from "./persona.actions";
import { PersonaComplete } from "./persona.constants";

export const usePersonasQuery = (
  params: Record<string, string | undefined>,
) => {
  return useQuery({
    queryKey: [PersonaComplete.QUERY_KEY, params],
    queryFn: () => getPersonas(params),
    refetchOnWindowFocus: true,
  });
};

export const usePersonaQuery = (id: number) => {
  return useQuery({
    queryKey: [PersonaComplete.QUERY_KEY, id],
    queryFn: () => getPersona(id),
    refetchOnWindowFocus: true,
    enabled: !!id,
  });
};

export const usePersonaSelectQuery = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["personas-select", params],
    queryFn: () => getPersonas(params as Record<string, string | undefined>),
    refetchOnWindowFocus: false,
  });
};

export const usePersonasTecnicosQuery = (params: Record<string, any> = {}) => {
  const { enabled = true, ...apiParams } = params;
  return useQuery({
    queryKey: ["personas-tecnicos", apiParams],
    queryFn: () =>
      getPersonas({
        tipo_empleado: "Técnico",
        ...apiParams,
      } as Record<string, string | undefined>),
    enabled,
    refetchOnWindowFocus: false,
  });
};
