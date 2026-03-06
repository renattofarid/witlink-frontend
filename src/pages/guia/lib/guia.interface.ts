import type { PaginatedResponse } from "@/lib/core.interface";

export interface GuiaSerieResource {
  id: number;
  producto_id: number;
  serie: string;
  situacion: string;
  mac: string;
  ua: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface GuiaProductoResource {
  id: number;
  producto: {
    id: number;
    categoria_id: number;
    sap: string;
    nombre: string;
    tipo: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  };
  cantidad: string;
  observaciones: string;
  series: Array<{ serie: GuiaSerieResource }>;
}

export interface GuiaProveedorResource {
  id: number;
  ruc: string;
  razon_social: string;
  telefono: string;
  direccion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface GuiaResource {
  id: number;
  numero: string;
  fecha: string;
  proveedor: GuiaProveedorResource;
  usuario: {
    id: number;
    persona_id: number;
    tipo_usuario_id: number;
    oficina_id: number;
    nombre_usuario: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  };
  productos: GuiaProductoResource[];
  deleted_at?: string | null;
}

export type GuiaResponse = PaginatedResponse<GuiaResource>;

export interface GuiaSerieBody {
  serie: string;
  mac: string;
  ua: string;
  observaciones: string;
}

export interface GuiaProductoBody {
  producto_id: number;
  categoria_id: number;
  sap: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  observaciones: string;
  series: GuiaSerieBody[];
}

export interface GuiaCreateBody {
  numero: string;
  fecha: string;
  proveedor_id: number;
  productos: GuiaProductoBody[];
}

export interface GuiaEditBody {
  nombre: string;
}
