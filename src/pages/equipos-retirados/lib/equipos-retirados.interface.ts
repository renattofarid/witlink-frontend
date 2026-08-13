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
  emta_mac?: string;
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

export interface EquipoRetiradoAlmacenRef {
  id: number;
  nombre: string;
  codigo: string;
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
  /** Almacén donde reside el documento (p.ej. el consolidado de retirados corporativo). */
  almacen_id?: number;
  almacen?: EquipoRetiradoAlmacenRef | null;
  /** Subalmacén operativo al que pertenece el retirado (PINT, PMO, PEXT, Norte, Oriente, etc.). */
  almacen_pertenencia_id?: number | null;
  almacen_pertenencia?: EquipoRetiradoAlmacenRef | null;
}

export type EquiposRetiradosResponse = PaginationResponse<EquipoRetiradoResource>;

export interface EquipoRetiradoSerieBody {
  serie_id?: number | null;
  serie?: string | null;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
  observaciones?: string | null;
}

export interface EquipoRetiradoProductoBody {
  producto_id?: number | null;
  categoria_id?: number | null;
  sap?: string | null;
  nombre?: string | null;
  tipo?: string | null;
  origen?: string | null;
  necesita_serie?: boolean;
  necesita_mac?: boolean;
  necesita_emta_mac?: boolean;
  necesita_ua?: boolean;
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
  productos: AddProductosEquipoRetiradoBodyItem[];
}

export interface AddProductosEquipoRetiradoBodyItem {
  producto_id?: number | null;
  categoria_id?: number | null;
  sap?: string | null;
  nombre?: string | null;
  tipo?: string | null;
  origen?: string | null;
  necesita_serie?: boolean;
  necesita_mac?: boolean;
  necesita_emta_mac?: boolean;
  necesita_ua?: boolean;
  cantidad: number;
  series: EquipoRetiradoSerieBody[];
}

export interface AddSeriesEquipoRetiradoBody {
  detalle_producto_documento_equipo_retirado_id: number;
  series: EquipoRetiradoSerieBody[];
}
