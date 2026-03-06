import { useQuery } from "@tanstack/react-query";
import { getPersona, getPersonas } from "./persona.actions";
import { PersonaComplete } from "./persona.constants";

export const usePersonasQuery = (params: Record<string, string>) => {
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
