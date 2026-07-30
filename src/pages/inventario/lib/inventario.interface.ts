import type { PaginationResponse } from "@/lib/core.interface";

// Inventory — Series (Equipment)
export interface InventarioSerieResource {
  inventario_tecnico_id: number;
  serie_id: number;
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
  fecha: string;
  sap: string;
  producto: string;
  cantidad: number | string;
  ubicacion: string;
  personal: string | null;
  sot: string | null;
  motivo: string | null;
}

export type InventarioMaterialResponse = PaginationResponse<InventarioMaterialResource>;

// Series — Historial de movimientos
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
