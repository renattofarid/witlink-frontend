import type { PaginationResponse } from "@/lib/core.interface";

export interface MaterialProducto {
  id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MaterialResource {
  id: number;
  producto: MaterialProducto;
  cantidad: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type MaterialResponse = PaginationResponse<MaterialResource>;

export interface MaterialBody {
  producto_id: number;
  cantidad: number;
}
