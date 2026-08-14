import type { PaginationResponse } from "@/lib/core.interface";

export interface AlmacenResource {
  id: number;
  nombre: string;
  nombre_display?: string;
  codigo: string;
  direccion: string;
  created_at: string;
  updated_at: string;
  almacen_padre_id: number | null;
  almacen_padre_codigo: string | null;
  is_corporativo: boolean;
  es_subalmacen_corporativo: boolean;
}

export type AlmacenResponse = PaginationResponse<AlmacenResource>;

export interface AlmacenBody {
  nombre: string;
  codigo: string;
  direccion: string;
}
