import type { PaginationResponse } from "@/lib/core.interface";

export interface GuiaSerieResource {
  id: number;
  producto_id?: number;
  serie: string;
  situacion: string;
  mac: string | null;
  emta_mac?: string | null;
  ua: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface GuiaProductoResource {
  id: number;
  producto: {
    id: number;
    sap: string;
    nombre: string;
    tipo: string;
    origen?: string;
    necesita_serie?: boolean;
    necesita_mac?: boolean;
    necesita_emta_mac?: boolean;
    necesita_ua?: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  cantidad: string;
  confirmado: number;
  observaciones: string | null;
  series: Array<{
    serie?: GuiaSerieResource | null;
    confirmado: number;
    observaciones?: string | null;
    created_at?: string;
    updated_at?: string;
  }>;
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

export interface GuiaListResource {
  type: string;
  id: number;
  numero: string;
  fecha: string;
  almacen: string | null;
  sot: string | null;
  motivo: string | null;
  cantidad_materiales: number;
  cantidad_series: number;
  usuario: string;
  ruta_pdf_guia: string | null;
  confirmado: number;
  deleted_at?: string | null;
}

export interface GuiaResource {
  id: number;
  numero: string;
  fecha: string;
  ruta_pdf_guia: string | null;
  confirmado: number;
  usuario: GuiaUsuarioResource;
  productos?: GuiaProductoResource[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type GuiaResponse = PaginationResponse<GuiaListResource>;

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
  sap?: string | null;
  nombre?: string | null;
  tipo: "MATERIAL" | "EQUIPO" | null;
  origen: string | null;
  necesita_serie?: boolean | null;
  necesita_mac?: boolean | null;
  necesita_emta_mac?: boolean | null;
  necesita_ua?: boolean | null;
  cantidad: number;
  observaciones: string | null;
  series: GuiaSerieBody[] | null;
  /** Solo aplica cuando el producto es nuevo (rama `añadir`); no enviar si el producto ya existe. */
  lote?: string | null;
}

export interface GuiaCreateBody {
  numero: string;
  fecha: string;
  archivo?: File | null;
  productos: GuiaProductoBody[];
}

export interface GuiaSerieActualizarBody {
  serie_id: number;
  serie?: string | null;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
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
  archivo?: File | null;
  productos?: {
    añadir?: GuiaProductoBody[] | null;
    actualizar?: GuiaProductoActualizarBody[] | null;
  } | null;
}

export interface DetalleSeriesGuiaBody {
  producto_guia_id: number;
  series: Array<{
    serie?: string | null;
    mac?: string | null;
    emta_mac?: string | null;
    ua?: string | null;
  }>;
}

export type SerieLocalStatus = "pending" | "confirmed" | "error";

export interface SerieLocal {
  localId: string;
  productoGuiaId: number;
  serie: string;
  mac: string;
  emtaMac: string;
  ua: string;
  servidorId?: number;
  status: SerieLocalStatus;
  errorMessage?: string;
}
