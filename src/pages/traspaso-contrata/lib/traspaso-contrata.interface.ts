import type { PaginationResponse } from "@/lib/core.interface";

export interface TraspasoContrataMaterialBody {
  producto_id: number;
  cantidad: number;
}

export interface TraspasoContrataCreateBody {
  fecha: string;
  ruc_contrata: string;
  descripcion_contrata: string;
  direccion_contrata: string;
  observaciones?: string | null;
  materiales: TraspasoContrataMaterialBody[];
}

export interface TraspasoContrataMaterialResource {
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
  observaciones: string | null;
  materiales: TraspasoContrataMaterialResource[];
}

export type TraspasoContrataResponse =
  PaginationResponse<TraspasoContrataResource>;
