import type { PaginationResponse } from "@/lib/core.interface";

export interface MaterialProducto {
  id: number;
  categoria_id?: number;
  sap: string;
  nombre: string;
  lote: string;
  incluir_en_carga: boolean;
  es_liquidacion: boolean;
  costo: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  necesita_serie: boolean;
  necesita_mac: boolean;
  necesita_emta_mac: boolean;
  necesita_ua: boolean;
  origen: string;
  categoria?: string;
}

export interface MaterialResource {
  id: number;
  producto: MaterialProducto;
  cantidad: string;
  /** Origen del producto (p. ej. "WITLINK", "CLARO"). */
  origen?: string | null;
  /** Etiqueta legible del origen; usar en UI en vez de `origen` cuando esté presente. */
  origen_label?: string | null;
  created_at: string;
  updated_at: string;
}

export type MaterialResponse = PaginationResponse<MaterialResource>;

export interface MaterialBody {
  producto_id: number;
  cantidad: number;
}
