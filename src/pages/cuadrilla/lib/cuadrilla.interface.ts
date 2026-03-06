import type { PaginatedResponse } from "@/lib/core.interface";

export interface CuadrillaResource {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CuadrillaResponse = PaginatedResponse<CuadrillaResource>;

export interface CuadrillaBody {
  nombre: string;
}
