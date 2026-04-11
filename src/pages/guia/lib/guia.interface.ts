import type { PaginationResponse } from "@/lib/core.interface";

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
  series: Array<{ serie?: GuiaSerieResource | null; observaciones?: string | null }>;
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

export interface GuiaPersonaResource {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface GuiaUsuarioResource {
  id: number;
  oficina_id: number;
  nombre_usuario: string;
  persona: GuiaPersonaResource;
}

export interface GuiaResource {
  id: number;
  numero: string;
  fecha: string;
  ruta_pdf_guia: string | null;
  proveedor: GuiaProveedorResource;
  usuario: GuiaUsuarioResource;
  productos?: GuiaProductoResource[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type GuiaResponse = PaginationResponse<GuiaResource>;

export interface GuiaSerieBody {
  serie_id?: number | null;
  serie?: string | null;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
  observaciones?: string | null;
}

export interface GuiaProductoBody {
  producto_id?: number;
  categoria_id?: number | null;
  sap?: string | null;
  nombre?: string | null;
  tipo?: "material" | "equipo" | null;
  origen?: string | null;
  necesita_serie?: boolean | null;
  necesita_mac?: boolean | null;
  necesita_emta_mac?: boolean | null;
  necesita_ua?: boolean | null;
  cantidad: number;
  observaciones: string | null;
  series: GuiaSerieBody[] | null;
}

export interface GuiaCreateBody {
  numero: string;
  fecha: string;
  // proveedor_id: number;
  archivo?: File | null;
  productos: GuiaProductoBody[];
}

export interface GuiaSerieActualizarBody {
  serie_id: number;
  observaciones?: string | null;
}

export interface GuiaProductoActualizarBody {
  id: number;
  cantidad?: number | null;
  observaciones?: string | null;
  series?: {
    actualizar?: GuiaSerieActualizarBody[] | null;
    añadir?: GuiaSerieBody[] | null;
  } | null;
}

export interface GuiaEditBody {
  numero?: string | null;
  fecha?: string | null;
  proveedor_id?: number | null;
  archivo?: File | null;
  productos?: {
    añadir?: GuiaProductoBody[] | null;
    actualizar?: GuiaProductoActualizarBody[] | null;
  } | null;
}
