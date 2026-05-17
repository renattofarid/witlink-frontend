import type { PaginationResponse } from "@/lib/core.interface";

export type TipoEmpleado =
  | "Técnico"
  | "Administrativo"
  | "Supervisor de campo"
  | "Corporativo";

export interface PersonaResource {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  carnet_extranjeria: string | null;
  direccion: string;
  telefono: string | null;
  correo: string | null;
  tipo_empleado: TipoEmpleado | null;
  cuadrilla_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type PersonaResponse = PaginationResponse<PersonaResource>;

export interface PersonaBody {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  carnet_extranjeria?: string | null;
  direccion: string;
  telefono?: string | null;
  correo?: string | null;
  tipo_empleado?: string | null;
  cuadrilla_id?: number | null;
}
