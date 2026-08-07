import type { PaginationResponse } from "@/lib/core.interface";

export interface SotRemisionResource {
  id: number;
  sot: string;
  ruc: string | null;
  razon_social: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
  estado?: string | null;
  zona?: string | null;
  sede?: string | null;
  /** Fila original del Excel, tal cual fue importada. */
  datos: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export type SotRemisionResponse = PaginationResponse<SotRemisionResource>;

export interface SotRemisionConsultaResponse {
  data: SotRemisionResource;
}

export interface ImportarSotRemisionExcelResult {
  importados: number;
  actualizados: number;
  omitidos: number;
  errores: string[];
}

export interface ImportarSotRemisionExcelResponse {
  message: string;
  data: ImportarSotRemisionExcelResult;
}
