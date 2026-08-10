import type { PaginationResponse } from "@/lib/core.interface";

// Inventory — Series (Equipment)
export interface InventarioSerieResource {
  inventario_tecnico_id: number;
  serie_id: number;
  /** Algunos endpoints (p. ej. corporativo) devuelven el id crudo del modelo en vez de `serie_id`. */
  id?: number;
  situacion: string;
  situacion_label:
    | "PENDIENTE"
    | "DISPONIBLE"
    | "DESPACHADO"
    | "LIQUIDADO"
    | "RETIRADO"
    | "DEVUELTO"
    | "DEVUELTO A CLARO";
  fecha: string;
  guia: string;
  sap: string;
  producto: string;
  serie: string;
  mac: string | null;
  emta: string | null;
  ua: string | null;
  ubicacion: string;
  dias: number;
  personal: string;
  tecnico: string;
  tecnico_id: number;
  sot: string | null;
  motivo: string | null;
  almacen_origen: string;
  contabilizado: string | null;
  /** SOT que reservó este equipo (solo corporativo); distinto de `sot`, que es el SOT final de despacho/liquidación. */
  reserva_sot?: string | null;
}

export type InventarioSerieResponse =
  PaginationResponse<InventarioSerieResource> & {
    /**
     * Terms sent in the bulk search that did not match any record under the
     * applied filters. Empty (or absent) when every term matched at least one
     * result. Used to surface a non-blocking alert to the user.
     */
    no_registrados?: string[];
  };

// Inventory — Materiales
export interface InventarioMaterialResource {
  producto_id: number;
  /** Algunos endpoints (p. ej. corporativo) devuelven el id crudo del modelo en vez de `producto_id`. */
  id?: number;
  fecha: string;
  sap: string;
  producto: string;
  cantidad: number | string;
  ubicacion: string;
  personal: string | null;
  sot: string | null;
  motivo: string | null;
  /** Cantidad reservada por SOT dentro de `cantidad` (solo corporativo). */
  cantidad_reservada?: number | string | null;
}

export type InventarioMaterialResponse = PaginationResponse<InventarioMaterialResource>;

// Series — Historial de movimientos (legado, endpoint /series/{id}/movimientos)
export interface SerieMovimientoResource {
  fecha: string;
  guia: string | null;
  tipo_movimiento: string;
  movimiento: string;
  ubicacion: string;
  origen: string;
  destino: string;
  registro: string;
  usuario: string;
}

// Series — Historial/trazabilidad completa (endpoint /series/{id}/historial)
export interface SerieHistorialProductoResource {
  id: number;
  sap: string;
  nombre: string;
  tipo: string;
  origen: string;
}

export interface SerieHistorialTecnicoResource {
  id: number;
  nombre: string;
  dni: string;
}

export interface SerieHistorialSerieResource {
  id: number;
  serie: string;
  mac: string | null;
  emta_mac: string | null;
  ua: string | null;
  situacion: string;
  situacion_label: string;
  contabilizado: boolean;
  fecha_ingreso: string | null;
  producto: SerieHistorialProductoResource;
  almacen_actual: Record<string, unknown> | null;
  tecnico_actual: SerieHistorialTecnicoResource | null;
}

export interface SerieHistorialCierreDefinitivo {
  liquidacion_id: number;
  sot: string;
  estado_liquidacion: string;
  fecha: string;
  cerrada: boolean;
}

export interface SerieHistorialAlmacenResource {
  id: number;
  nombre: string;
}

export interface SerieHistorialEvento {
  orden: number;
  tipo: string;
  tipo_label: string;
  fecha: string;
  registrado_en: string;
  referencia_id: number | null;
  referencia: string | null;
  sot: string | null;
  estado: string | null;
  almacen: SerieHistorialAlmacenResource | null;
  tecnico: SerieHistorialTecnicoResource | null;
  usuario: string;
  detalle: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface SerieHistorialKardexItem {
  id: number;
  movimiento_id: number;
  fecha: string;
  codigo: string;
  producto: string;
  movimiento: string;
  cantidad: number;
  ubicacion: string;
  serie: string;
  referencia: string;
  stock_anterior: number;
  stock_actual: number;
  [key: string]: unknown;
}

export interface SerieHistorialResponse {
  serie: SerieHistorialSerieResource;
  sot_actual: string | null;
  cierre_definitivo: SerieHistorialCierreDefinitivo | null;
  reservas_sot: unknown[];
  tecnicos_asignados: SerieHistorialTecnicoResource[];
  eventos: SerieHistorialEvento[];
  kardex: SerieHistorialKardexItem[];
}
