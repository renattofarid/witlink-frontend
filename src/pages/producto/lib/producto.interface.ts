import type { PaginatedResponse } from "@/lib/core.interface";

export interface ProductoResource {
  id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categoria: {
    id: number;
    nombre: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  material: {
    id: number;
    producto_id: number;
    cantidad: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  } | null;
  series: any[];
}

export type ProductoResponse = PaginatedResponse<ProductoResource>;

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
