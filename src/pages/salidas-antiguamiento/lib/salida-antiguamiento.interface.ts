import type { PaginationResponse } from "@/lib/core.interface";
import type { AlmacenResource } from "@/pages/auth/lib/auth.interface";

export interface SalidaAntiguamientoResource {
  id: number;
  numero: string;
  fecha: string;
  almacen: AlmacenResource;
}

export type SalidaAntiguamientoResponse = PaginationResponse<SalidaAntiguamientoResource>;

// ── Detalle ───────────────────────────────────────────────────────────────

export interface SalidaAntiguamientoSerieDetalleResource {
  id: number;
  serie_id: number;
  serie: {
    id: number;
    serie: string;
    producto: { id: number; nombre: string; sap?: string };
  } | null;
}

export interface SalidaAntiguamientoMaterialDetalleResource {
  id: number;
  producto_id: number;
  cantidad: number;
  producto: { id: number; nombre: string; sap?: string };
}

export interface SalidaAntiguamientoDetailResource {
  id: number;
  numero: string;
  fecha: string;
  observaciones: string | null;
  almacen?: AlmacenResource;
  series: SalidaAntiguamientoSerieDetalleResource[];
  productos: SalidaAntiguamientoMaterialDetalleResource[];
}

// ── Creación ──────────────────────────────────────────────────────────────

export interface SalidaAntiguamientoMaterialBody {
  producto_id: number;
  cantidad: number;
}

export interface SalidaAntiguamientoCreateBody {
  series?: string[];
  materiales?: SalidaAntiguamientoMaterialBody[];
  observaciones?: string;
}
