import type { PaginationResponse } from "@/lib/core.interface";

export interface ProductoResource {
  id: number;
  sap: string;
  nombre: string;
  tipo: "MATERIAL" | "EQUIPO";
  origen: string;
  necesita_serie: boolean;
  necesita_mac: boolean;
  necesita_emta_mac: boolean;
  necesita_ua: boolean;
  incluir_en_carga: boolean;
  costo: number | null;
  created_at: string;
  updated_at: string;
}

export type ProductoResponse = PaginationResponse<ProductoResource>;

export interface ProductoCreateBody {
  origen: string;
  sap?: string;
  nombre: string;
  tipo: string;
  necesita_serie?: boolean | null;
  necesita_mac?: boolean | null;
  necesita_emta_mac?: boolean | null;
  necesita_ua?: boolean | null;
  incluir_en_carga?: boolean | null;
  costo?: number | null;
}

export interface ProductoUpdateBody {
  origen: string;
  sap?: string;
  nombre: string;
  tipo: string;
  necesita_serie?: boolean | null;
  necesita_mac?: boolean | null;
  necesita_emta_mac?: boolean | null;
  necesita_ua?: boolean | null;
  incluir_en_carga?: boolean | null;
  costo?: number | null;
}
