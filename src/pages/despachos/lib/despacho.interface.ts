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

// ── Tipos anidados para la vista de detalle ──────────────────────────────────

export interface DespachoPersonaResource {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
}

export interface DespachoUsuarioResource {
  id: number;
  nombre_usuario: string;
  persona: DespachoPersonaResource | null;
}

export interface DespachoTecnicoResource {
  id: number;
  persona: DespachoPersonaResource | null;
}

export interface DespachoAlmacenResource {
  id: number;
  nombre: string;
  direccion: string | null;
}

export interface DespachoSerieDetalleResource {
  id: number;
  serie: string;
  situacion: string;
  mac: string | null;
  emta_mac: string | null;
  ua: string | null;
}

export interface DespachoProductoDetalleResource {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    sap: string;
    tipo: string | null;
    origen: string | null;
  };
  series: Array<{ serie: DespachoSerieDetalleResource | null }>;
}

export interface DespachoDetailResource extends DespachoResource {
  tecnico: DespachoTecnicoResource | null;
  usuario: DespachoUsuarioResource | null;
  almacen: DespachoAlmacenResource | null;
  productos: DespachoProductoDetalleResource[];
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
