import type { PaginationResponse } from "@/lib/core.interface";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";

export type SituationLabel =
  | "PENDIENTE"
  | "DISPONIBLE"
  | "DESPACHADO"
  | "LIQUIDADO"
  | "RETIRADO"
  | "DEVUELTO";

export interface SerieResource {
  id: number;
  situacion: string;
  situacion_label: SituationLabel;
  serie?: string;
  emta_mac?: string;
  mac?: string;
  ua?: string;
  producto: ProductoResource;
  tecnico?: Tecnico;
  guia_numero?: string;
  created_at: string;
  updated_at: string;
}

interface Tecnico {
  id: number;
  nombre: string;
}

export type SerieResponse = PaginationResponse<SerieResource>;

export interface SerieBody {
  producto_id: number;
  serie: string;
  mac: string;
  emta_mac: string;
  ua: string;
}
