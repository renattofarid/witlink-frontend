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
  /** Propios de productos importados desde el Excel SAPUI5 del cliente. */
  posicion?: string | null;
  unidad_medida?: string | null;
  nro_lote?: string | null;
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
  /** Solo en filas `type: "retirado"` de almacenes corporativos: subalmacén operativo real (PINT, PMO, PEXT, Norte, Oriente...). Si viene null, usar `almacen` como fallback. */
  almacen_pertenencia?: string | null;
  sot: string | null;
  motivo: string | null;
  tipo?: string | null;
  nombre_tipo?: string | null;
  cantidad_materiales: number;
  cantidad_series: number;
  usuario: string;
  ruta_pdf_guia: string | null;
  confirmado: number;
  is_corporativo?: boolean;
  deleted_at?: string | null;
}

export interface GuiaResource {
  id: number;
  numero: string;
  fecha: string;
  ruta_pdf_guia: string | null;
  confirmado: number;
  is_corporativo?: boolean;
  usuario: GuiaUsuarioResource;
  productos?: GuiaProductoResource[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  /** Campos propios de guías importadas desde el Excel SAPUI5 del cliente. */
  numero_entrega?: string | null;
  numero_guia_1?: string | null;
  numero_guia_2?: string | null;
  sol_abastecimiento?: string | null;
  pedido_traslado?: string | null;
  origen_importacion?: string | null;
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

// Importación masiva de guías corporativas desde el formato SAPUI5 del cliente
// (POST /guias/importar-corporativo).
export interface ImportarGuiasCorporativoGuia {
  id: number;
  numero: string;
  numero_entrega: string | null;
  numero_guia_1: string | null;
  numero_guia_2: string | null;
  productos: number;
}

export interface ImportarGuiasCorporativoResponse {
  guias_creadas: number;
  guias_omitidas: number;
  productos_creados: number;
  productos_actualizados: number;
  productos_restaurados: number;
  filas_procesadas: number;
  filas_omitidas: number;
  errores: string[];
  guias: ImportarGuiasCorporativoGuia[];
  mensaje: string;
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
