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
  /** Origen del producto (p. ej. "WITLINK", "CLARO"). */
  origen?: string | null;
  /** Etiqueta legible del origen; usar en UI en vez de `origen` cuando esté presente. */
  origen_label?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type MaterialResponse = PaginationResponse<MaterialResource>;

export interface MaterialBody {
  producto_id: number;
  cantidad: number;
}
