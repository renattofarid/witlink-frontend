import type { PaginationResponse } from "@/lib/core.interface";

export interface ProductoResource {
  id: number;
  sap: string;
  nombre: string;
  tipo: "MATERIAL" | "EQUIPO";
  origen: string;
  categoria: Categoria;
  necesita_serie: boolean;
  necesita_mac: boolean;
  necesita_emta_mac: boolean;
  necesita_ua: boolean;
  costo: number | null;
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
  origen: string;
  sap?: string;
  nombre: string;
  tipo: string;
  necesita_serie?: boolean | null;
  necesita_mac?: boolean | null;
  necesita_emta_mac?: boolean | null;
  necesita_ua?: boolean | null;
  costo?: number | null;
}

export interface ProductoUpdateBody {
  categoria_id: number;
  origen: string;
  sap?: string;
  nombre: string;
  tipo: string;
  necesita_serie?: boolean | null;
  necesita_mac?: boolean | null;
  necesita_emta_mac?: boolean | null;
  necesita_ua?: boolean | null;
  costo?: number | null;
}
