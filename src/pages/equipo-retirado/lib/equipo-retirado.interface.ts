import type { PaginationResponse } from "@/lib/core.interface";

export interface EquipoRetiradoSerieResource {
  id: number;
  serie_id: number;
  serie: string;
  mac: string | null;
  observaciones: string | null;
}

export interface EquipoRetiradoProductoResource {
  id: number;
  producto_id: number;
  producto: {
    id: number;
    nombre: string;
    sap: string;
    tipo: string;
  };
  cantidad: number;
  series: EquipoRetiradoSerieResource[] | null;
}

export interface EquipoRetiradoResource {
  id: number;
  fecha: string;
  sot: string;
  tipo: "P" | "C" | "O";
  productos?: EquipoRetiradoProductoResource[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type EquipoRetiradoResponse = PaginationResponse<EquipoRetiradoResource>;

export interface EquipoRetiradoSerieBody {
  serie_id: number;
  observaciones?: string | null;
}

export interface EquipoRetiradoProductoBody {
  producto_id: number;
  cantidad: number;
  series: EquipoRetiradoSerieBody[] | null;
}

export interface EquipoRetiradoBody {
  fecha: string;
  sot: string;
  tipo: "P" | "C" | "O";
  productos: EquipoRetiradoProductoBody[];
}
