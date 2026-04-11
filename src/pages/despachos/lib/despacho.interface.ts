import type { PaginationResponse } from "@/lib/core.interface";

export interface DespachoResource {
  id: number;
  usuario_id: number;
  tecnico_id: number;
  numero: string;
  fecha: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  almacen_id: number;
}

export type DespachoResponse = PaginationResponse<DespachoResource>;

export interface DespachoSerieBody {
  serie: string;
}

export interface DespachoProductoBody {
  id: number;
  cantidad: number;
  series: DespachoSerieBody[];
}

export interface DespachoCreateBody {
  tecnico_id: number;
  productos: DespachoProductoBody[];
}

export interface DespachoMasivoSeriesBody {
  tecnico_id: number;
  series: string[];
}
