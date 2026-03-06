import type { PaginatedResponse } from "@/lib/core.interface";

export interface CategoriaResource {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CategoriaResponse = PaginatedResponse<CategoriaResource>;

export interface CategoriaBody {
  nombre: string;
}
