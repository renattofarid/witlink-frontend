import type { PaginationResponse } from "@/lib/core.interface";

// Inventory — Series (Equipment)
export interface InventarioSerieResource {
  inventario_tecnico_id: number;
  serie_id: number;
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
}

export type InventarioSerieResponse = PaginationResponse<InventarioSerieResource>;

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
