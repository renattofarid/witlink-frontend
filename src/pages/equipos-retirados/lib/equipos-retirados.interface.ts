import type { PaginationResponse } from "@/lib/core.interface";

export interface EquipoRetiradoSerieProductoResource {
  id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  origen: string;
  serie: number;
  mac: number;
  "emta-mac": number;
  ua: number;
}

export interface EquipoRetiradoSerieResource {
  id: number;
  serie: string;
  situacion: string;
  mac: string;
  ua: string;
  producto: EquipoRetiradoSerieProductoResource;
  created_at: string;
  updated_at: string;
}

export interface EquipoRetiradoProductoSeriesResource {
  serie: EquipoRetiradoSerieResource;
  observacion: string;
  created_at: string;
  updated_at: string;
}

export interface EquipoRetiradoProductoInnerResource {
  id: number;
  sap: string;
  nombre: string;
  tipo: string;
  necesita_serie: number;
  necesita_mac: number;
  necesita_emta_mac: string;
  necesita_ua: number;
  created_at: string;
  updated_at: string;
}

export interface EquipoRetiradoProductoResource {
  id: number;
  producto: EquipoRetiradoProductoInnerResource;
  cantidad: string;
  created_at: string;
  updated_at: string;
  series: EquipoRetiradoProductoSeriesResource[];
}

export interface EquipoRetiradoResource {
  id: number;
  sot: string;
  fecha: string;
  tipo: string;
  nombre_tipo: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  productos: EquipoRetiradoProductoResource[];
}

export type EquiposRetiradosResponse = PaginationResponse<EquipoRetiradoResource>;

export interface EquipoRetiradoSerieBody {
  serie_id: number;
  observaciones: string;
}

export interface EquipoRetiradoProductoBody {
  producto_id: number;
  origen: string;
  necesita_serie: boolean;
  necesita_mac: boolean;
  necesita_emta_mac: boolean;
  necesita_ua: boolean;
  cantidad: number;
  series: EquipoRetiradoSerieBody[];
}

export interface EquipoRetiradoCreateBody {
  fecha: string;
  sot: string;
  tipo: string;
  productos: EquipoRetiradoProductoBody[];
}

export interface EquipoRetiradoEditBody {
  sot: string;
  tipo: string;
  fecha: string;
}

export interface AddProductosEquipoRetiradoBody {
  documento_equipo_retirado_id: number;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    series: EquipoRetiradoSerieBody[];
  }>;
}

export interface AddSeriesEquipoRetiradoBody {
  detalle_producto_documento_equipo_retirado_id: number;
  series: EquipoRetiradoSerieBody[];
}
