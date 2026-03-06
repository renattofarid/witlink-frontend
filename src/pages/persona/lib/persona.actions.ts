import { api } from "@/lib/config";
import { PersonaComplete } from "./persona.constants";
import type { PersonaResponse, PersonaResource, PersonaBody } from "./persona.interface";

export const getPersonas = async (params: Record<string, string>): Promise<PersonaResponse> => {
  const { data } = await api.get(PersonaComplete.ENDPOINT, { params });
  return data;
};

export const getPersona = async (id: number): Promise<PersonaResource> => {
  const { data } = await api.get(`${PersonaComplete.ENDPOINT}/${id}`);
  return data;
};

export const createPersona = async (body: PersonaBody) => {
  const { data } = await api.post(PersonaComplete.ENDPOINT, body);
  return data;
};

export const updatePersona = async (id: number, body: PersonaBody) => {
  const { data } = await api.put(`${PersonaComplete.ENDPOINT}/${id}`, body);
  return data;
};

export const deletePersona = async (id: number) => {
  const { data } = await api.delete(`${PersonaComplete.ENDPOINT}/${id}`);
  return data;
};

export const restorePersona = async (id: number) => {
  const { data } = await api.post(`${PersonaComplete.ENDPOINT}/${id}/restaurar`);
  return data;
};
