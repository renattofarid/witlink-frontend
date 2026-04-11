import type { PaginationResponse } from "@/lib/core.interface";

// Inventory — Series (Equipment)
export interface InventarioSerieResource {
  id: number;
  fecha: string;
  guia: string;
  sap: string;
  producto: string;
  serie: string;
  mac: string;
  emta: string;
  ua: string;
  ubicacion: string;
  dias: number;
  personal: string;
  sot: string;
  motivo: string;
}

export type InventarioSerieResponse = PaginationResponse<InventarioSerieResource>;

// Inventory — Materiales
export interface InventarioMaterialResource {
  id: number;
  fecha: string;
  sap: string;
  producto: string;
  cantidad: number | string;
  ubicacion: string;
  personal: string;
  sot: string;
  motivo: string;
}

export type InventarioMaterialResponse = PaginationResponse<InventarioMaterialResource>;
