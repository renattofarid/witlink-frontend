import type { PaginatedResponse } from "@/lib/core.interface";

export interface PersonaResource {
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

export type PersonaResponse = PaginatedResponse<PersonaResource>;

export interface PersonaBody {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  direccion: string;
  telefono: string;
  correo: string;
}
