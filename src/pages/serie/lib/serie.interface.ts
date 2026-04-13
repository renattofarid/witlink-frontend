import type { PaginationResponse } from "@/lib/core.interface";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";

export interface SerieResource {
  id: number;
  situacion: string;
  serie?: string;
  emta_mac?: string;
  mac?: string;
  ua?: string;
  producto: ProductoResource;
  created_at: string;
  updated_at: string;
}

export type SerieResponse = PaginationResponse<SerieResource>;

export interface SerieBody {
  serie: string;
  situacion: string;
  mac: string;
  ua: string;
  producto_id: number;
}
