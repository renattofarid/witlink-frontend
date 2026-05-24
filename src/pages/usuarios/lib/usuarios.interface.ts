import type { PaginationResponse } from "@/lib/core.interface";

export interface PersonaResource {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  dni: string;
  carnet_extranjeria: string | null;
  direccion: string;
  telefono: string | null;
  correo: string | null;
  tipo_empleado: string;
  cuadrilla_id: number | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface OficinaResource {
  id: number;
  nombre: string;
  ubigeo: string;
  direccion: string;
  created_at: string;
  updated_at: string;
}

export interface UsuariosResource {
  id: number;
  nombre_usuario: string;
  oficina_id: number;
  persona: PersonaResource;
  oficina: OficinaResource;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type UsuariosResponse = PaginationResponse<UsuariosResource>;

export interface UsuariosCreateBody {
  persona_id: number;
  tipo_usuario_id: number;
  oficina_id: number;
  nombre_usuario: string;
  contraseña: string;
}

export interface UsuariosEditBody {
  tipo_usuario_id: number;
  oficina_id: number;
  nombre_usuario: string;
  contraseña: string;
}
