import type { PaginatedResponse } from "@/lib/core.interface";

export interface TecnicoPersonaResource {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  direccion: string;
  telefono: string;
  correo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TecnicoCuadrillaResource {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TecnicoResource {
  id: number;
  cuadrilla_id: number;
  persona_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cuadrilla: TecnicoCuadrillaResource;
  persona: TecnicoPersonaResource;
}

export type TecnicoResponse = PaginatedResponse<TecnicoResource>;

export interface TecnicoCreateBody {
  cuadrilla_id: number;
  persona_id: number;
}

export interface TecnicoEditBody {
  cuadrilla_id: number;
}
