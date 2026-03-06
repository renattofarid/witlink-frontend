import type { PaginatedResponse } from "@/lib/core.interface";

export interface TipoUsuarioResource {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type TipoUsuarioResponse = PaginatedResponse<TipoUsuarioResource>;

export interface TipoUsuarioBody {
  nombre: string;
}

export interface GrupoMenuResource {
  id: number;
  nombre: string;
  icono: string;
  orden: string;
}

export interface OpcionMenuResource {
  id: number;
  nombre: string;
  ruta: string;
  orden: string;
  icono: string;
  grupo_menu_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

export interface OpcionMenuWithGrupo extends OpcionMenuResource {
  grupo_menu: GrupoMenuResource;
}

export interface PermisoBody {
  role_id: number;
  menu_option_id: number;
}
