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
}

export type KardexResponse = PaginationResponse<KardexResource>;
