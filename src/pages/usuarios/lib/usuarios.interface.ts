import type { PaginatedResponse } from "@/lib/core.interface";

export interface UsuariosResource {
  id: number;
  persona_id: number;
  tipo_usuario_id: number;
  oficina_id: number;
  nombre_usuario: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type UsuariosResponse = PaginatedResponse<UsuariosResource>;

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
