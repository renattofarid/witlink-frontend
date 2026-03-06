import type { PaginatedResponse } from "@/lib/core.interface";

export interface OficinaResource {
  id: number;
  nombre: string;
  ubigeo: string;
  direccion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type OficinaResponse = PaginatedResponse<OficinaResource>;

export interface OficinaBody {
  nombre: string;
  ubigeo: string;
  direccion: string;
}
