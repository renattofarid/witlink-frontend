import type { PaginationResponse } from "@/lib/core.interface";

export interface MenuResource {
  id: number;
  nombre: string;
  icono: string;
  orden: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type MenuResponse = PaginationResponse<MenuResource>;

export interface MenuBody {
  nombre: string;
  icono: string;
  orden: number;
}

export interface OpcionMenuResource {
  id: number;
  nombre: string;
  ruta: string;
  orden: string;
  icono: string;
  grupo_menu_id: number;
  grupo_menu?: MenuResource;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OpcionMenuBody {
  nombre: string;
  ruta: string;
  icono: string;
  orden: string;
  grupo_menu_id: number;
}
