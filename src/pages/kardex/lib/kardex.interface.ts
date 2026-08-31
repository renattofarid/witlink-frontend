import type { PaginationResponse } from "@/lib/core.interface";

export interface KardexResource {
  fecha: string;
  codigo: string;
  origen: string;
  producto: string;
  tipo: string;
  movimiento: string;
  cantidad: number;
  ubicacion: string;
  serie: string;
  referencia: string;
  pedido: string;
  stock_anterior: string;
  stock_actual: string;
}

export type KardexResponse = PaginationResponse<KardexResource>;
