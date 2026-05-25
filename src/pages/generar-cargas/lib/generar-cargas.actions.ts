import { api } from "@/lib/config";
import type {
  PersonaResource,
  PersonaResponse,
} from "@/pages/persona/lib/persona.interface";

export const getTecnicosNoFavoritos = async (
  search: string,
): Promise<PersonaResponse> => {
  const { data } = await api.get("/personas", {
    params: { tipo_empleado: "Técnico", favorito: "0", search, per_page: "20" },
  });
  return data;
};

export const getFavoritosTecnicos = async (
  params: Record<string, string | undefined>,
): Promise<PersonaResponse> => {
  const { data } = await api.get("/tecnicos/favoritos", { params });
  return data;
};

export const getFavoritosAll = async (): Promise<PersonaResource[]> => {
  const { data } = await api.get("/tecnicos/favoritos", {
    params: { per_page: 500 },
  });
  return data.data;
};

export const generarCargaTecnico = async (tecnicoId: number): Promise<Blob> => {
  const { data } = await api.get(`/tecnicos/${tecnicoId}/generar-carga`, {
    responseType: "blob",
  });
  return data;
};

export const toggleFavoritoTecnico = async (
  tecnicoId: number,
): Promise<{ favorito: boolean }> => {
  const { data } = await api.patch(`/tecnicos/${tecnicoId}/favorito`);
  return data.data;
};
