import type { PaginationResponse } from "@/lib/core.interface";

export interface KardexResource {
  fecha: string;
  codigo: string;
  producto: string;
  tipo: string;
  movimiento: string;
  cantidad: number;
  ubicacion: string;
  serie: string;
  stock_anterior: number;
  stock_actual: number;
}

export type KardexResponse = PaginationResponse<KardexResource>;
