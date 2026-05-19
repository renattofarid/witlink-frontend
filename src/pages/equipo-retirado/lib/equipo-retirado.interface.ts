import type { PaginationResponse } from "@/lib/core.interface";

export interface EquipoRetiradoSerieItemResource {
  serie: {
    id: number;
    serie: string;
    situacion: string;
    mac: string;
    ua: string;
    created_at: string;
    updated_at: string;
  };
  observacion: string;
  created_at: string;
  updated_at: string;
}

export interface EquipoRetiradoProductoItemResource {
  id: number;
  producto: {
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
  };
  cantidad: string;
  created_at: string;
  updated_at: string;
  series: EquipoRetiradoSerieItemResource[];
}

export interface EquipoRetiradoResource {
  id: number;
  sot: string;
  fecha: string;
  tipo: string;
  nombre_tipo: string;
  productos: EquipoRetiradoProductoItemResource[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type EquipoRetiradoResponse = PaginationResponse<EquipoRetiradoResource>;

// ── Body types ────────────────────────────────────────────────────────────────

/** Usado en el endpoint de creación principal */
export interface EquipoRetiradoSerieCreateBody {
  serie?: string | null;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
  observaciones?: string | null;
}

/** Usado en el endpoint de agregar series en modo edición */
export interface EquipoRetiradoSerieBody {
  serie_id: number;
  observaciones?: string | null;
}

export interface EquipoRetiradoProductoBody {
  producto_id: number;
  cantidad: number;
  series: EquipoRetiradoSerieCreateBody[] | null;
}

export interface EquipoRetiradoCreateBody {
  fecha: string;
  sot: string;
  tipo: string;
  productos: EquipoRetiradoProductoBody[];
}

export interface EquipoRetiradoEditHeaderBody {
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

/** @deprecated use EquipoRetiradoCreateBody */
export type EquipoRetiradoBody = EquipoRetiradoCreateBody;
