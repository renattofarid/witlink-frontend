import type { PaginationResponse } from "@/lib/core.interface";

export interface ProductoResource {
  id: number;
  sap: string;
  nombre: string;
  tipo: string;
  categoria: Categoria;
  created_at: string;
  updated_at: string;
}

interface Categoria {
  id: number;
  nombre: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}

export type ProductoResponse = PaginationResponse<ProductoResource>;

export interface ProductoCreateBody {
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
}

export interface ProductoUpdateBody {
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
}
