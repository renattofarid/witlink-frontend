import type { PaginationResponse } from "@/lib/core.interface";
import type { ProductoResource } from "@/pages/producto/lib/producto.interface";

export type SituationLabel =
  | "PENDIENTE"
  | "DISPONIBLE"
  | "DESPACHADO"
  | "LIQUIDADO"
  | "RETIRADO"
  | "DEVUELTO"
  | "INSTALADO"
  | "DEVUELTO A CLARO";

export interface SerieResource {
  id: number;
  situacion: string;
  situacion_label: SituationLabel;
  serie?: string;
  emta_mac?: string;
  mac?: string;
  ua?: string;
  producto: ProductoResource;
  tecnico?: Tecnico;
  guia_numero?: string;
  dias_en_almacen?: number;
  created_at: string;
  updated_at: string;
}

interface Tecnico {
  id: number;
  nombre: string;
}

export type SerieResponse = PaginationResponse<SerieResource>;

export interface SerieBody {
  producto_id: number;
  serie: string;
  mac: string;
  emta_mac: string;
  ua: string;
}

export interface SerieValidacionResponse {
  serie: {
    id: number;
    producto_id: number;
    serie: string;
    situacion: string;
    mac: string | null;
    ua: string | null;
    almacen_id: number;
    deleted_at: string | null;
    producto: {
      id: number;
      sap: string;
      nombre: string;
      tipo: string;
    };
  };
}

export interface ImportarSeriesExcelResult {
  total_filas: number;
  series_creadas: number;
  series_actualizadas: number;
  series_omitidas: number;
  productos_creados?: number;
  productos_actualizados?: number;
  errores: string[];
}

