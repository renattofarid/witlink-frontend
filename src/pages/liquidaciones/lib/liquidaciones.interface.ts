import type { PaginationResponse } from "@/lib/core.interface";

// ── SOT / Liquidación principal ───────────────────────────────────────────────

export interface LiquidacionResource {
  id: number;
  sot: string;
  fecha: string;
  codigo: string;
  direccion: string;
  distrito: string;
  plano: string;
  paquete: string;
  contacto: string;
  tipo_trabajo: string;
  estado: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  usuario_id: number;
  almacen_id: number;
  nombre: string;
  tecnico1: number | null;
  tecnico2: number | null;
  estado_liquidacion: string | null;
  observaciones: string | null;
  acta: ActaResource | null;
}

// ── Documentos / equipos retirados ────────────────────────────────────────────

export interface SerieProducto {
  id: number;
  situacion: string;
  serie: string;
  emta_mac: string | null;
  mac: string | null;
  ua: string | null;
  producto: {
    id: number;
    categoria_id: number;
    sap: string;
    nombre: string;
    tipo: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    necesita_serie: boolean;
    necesita_mac: boolean;
    necesita_emta_mac: boolean;
    necesita_ua: boolean;
    origen: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductoCategoria {
  [key: string]: unknown;
}

export interface MaterialProducto {
  id: number;
  producto_id: number;
  cantidad: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  almacen_id: number;
}

export interface ProductoDetalle {
  id: number;
  sap: string;
  nombre: string;
  tipo: string;
  origen: string;
  categoria: ProductoCategoria;
  necesita_serie: boolean;
  necesita_mac: boolean;
  necesita_emta_mac: boolean;
  necesita_ua: boolean;
  stock: number;
  material: MaterialProducto | null;
  series: SerieProducto[];
  created_at: string;
  updated_at: string;
}

export interface DocumentoProductoItem {
  id: number;
  producto: ProductoDetalle;
  cantidad: string;
  created_at: string;
  updated_at: string;
  series: Array<{
    serie: SerieProducto;
    observacion: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface DocumentoEquiposRetirados {
  id: number;
  sot: string;
  fecha: string;
  tipo: string;
  nombre_tipo: string;
  created_at: string;
  updated_at: string;
  productos: DocumentoProductoItem[];
}

export interface SotSearchResponse {
  liquidacion: LiquidacionResource;
  documentos_equipos_retirados: DocumentoEquiposRetirados[];
}

// ── Detalle de liquidación (response del guardado) ────────────────────────────

export interface DetalleProductoLiquidacionItem {
  id: number;
  liquidacion_id: number;
  tecnico_id: number;
  cantidad: string;
  series: Array<{
    serie: SerieProducto;
    created_at: string;
    updated_at: string;
  }>;
}

export interface SaveProductosResponse {
  data: DetalleProductoLiquidacionItem[];
}

// ── Carrito temporal ──────────────────────────────────────────────────────────

export interface LiquidacionCartItem {
  tempId: string;
  tipo: "material" | "serie";
  producto_id: number;
  producto_nombre: string;
  producto_sap: string;
  tecnico_id: number;
  tecnico_nombre: string;
  cantidad: number;
  series: Array<{ id: number; serie: string }>;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface SaveProductosBody {
  liquidacion_id: number;
  cantidad: number;
  productos: Array<{
    cantidad: number;
    tecnico_id: number;
    producto_id: number;
    series: number[];
  }>;
}

// ── Actas ─────────────────────────────────────────────────────────────────────

export interface ActaResource {
  fecha: string;
  liquidacion_id: number;
  ruta_archivo: string;
  created_at: string;
  updated_at: string;
}

// ── Listado paginado ──────────────────────────────────────────────────────────

export type LiquidacionesResponse = PaginationResponse<LiquidacionResource>;
