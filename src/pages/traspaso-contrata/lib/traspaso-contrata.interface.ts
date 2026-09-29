import type { PaginationResponse } from "@/lib/core.interface";

export interface TraspasoContrataMaterialBody {
  producto_id: number;
  cantidad: number;
}

export interface TraspasoContrataSerieAvailable {
  id: number;
  serie: string;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
  producto_id: number;
  sap?: string | null;
  producto?: string | null;
}

export interface TraspasoContrataSerieResource {
  id?: number;
  serie_id: number;
  serie: string;
  mac?: string | null;
  emta_mac?: string | null;
  ua?: string | null;
  producto_id?: number;
  sap?: string | null;
  producto?: string | null;
  movimiento_id?: number;
}

export interface TraspasoContrataCreateBody {
  fecha: string;
  ruc_contrata: string;
  descripcion_contrata: string;
  direccion_contrata: string;
  conductor?: string | null;
  licencia_conducir?: string | null;
  placa_vehiculo?: string | null;
  observaciones?: string | null;
  materiales?: TraspasoContrataMaterialBody[];
  series?: number[];
}

export interface TraspasoContrataMaterialResource {
  id?: number;
  producto_id: number;
  sap: string;
  producto: string;
  cantidad: number;
  movimiento_id: number;
}

export interface TraspasoContrataResource {
  id: number;
  numero: string;
  fecha: string;
  ruc_contrata: string;
  descripcion_contrata: string;
  direccion_contrata: string;
  conductor: string | null;
  licencia_conducir: string | null;
  placa_vehiculo: string | null;
  observaciones: string | null;
  tiene_documento_firmado: boolean;
  documento_firmado: {
    extension: string;
    subido_at: string;
    usuario: string | null;
  } | null;
  materiales?: TraspasoContrataMaterialResource[];
  series?: TraspasoContrataSerieResource[];
}

export type TraspasoContrataResponse =
  PaginationResponse<TraspasoContrataResource>;
