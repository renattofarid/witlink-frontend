import type { PaginationResponse } from "@/lib/core.interface";

export interface AlmacenResource {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  created_at: string;
  updated_at: string;
}

export type AlmacenResponse = PaginationResponse<AlmacenResource>;

export interface AlmacenBody {
  nombre: string;
  codigo: string;
  direccion: string;
}
