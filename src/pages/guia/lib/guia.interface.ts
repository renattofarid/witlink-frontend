import type { PaginatedResponse } from "@/lib/core.interface";

export interface GuiaResource {
  id: number;
  ruc: string;
  razon_social: string;
  telefono: string;
  direccion: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type GuiaResponse = PaginatedResponse<GuiaResource>;

export interface GuiaBody {
  ruc: string;
  razon_social: string;
  telefono: string;
  direccion: string;
}
