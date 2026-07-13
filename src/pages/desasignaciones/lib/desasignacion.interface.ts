import type { PaginationResponse } from "@/lib/core.interface";
import type { AlmacenResource } from "@/pages/auth/lib/auth.interface";
import type { UsuariosResource } from "@/pages/usuarios/lib/usuarios.interface";

export interface DesasignacionTecnicoResource {
  id: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  nombre_completo?: string;
  dni?: string;
}

export interface DesasignacionResource {
  id: number;
  numero: string;
  fecha: string;
  tecnico: DesasignacionTecnicoResource;
  almacen: AlmacenResource;
  usuario?: UsuariosResource;
  observaciones?: string | null;
  deleted_at: string | null;
}

export type DesasignacionResponse = PaginationResponse<DesasignacionResource>;

// ── Detalle ───────────────────────────────────────────────────────────────

export interface DesasignacionSerieDetalleResource {
  id: number;
  serie_id: number;
  serie: {
    id: number;
    serie: string;
    producto: { id: number; nombre: string; sap?: string };
  } | null;
}

export interface DesasignacionMaterialDetalleResource {
  id: number;
  producto_id: number;
  cantidad: number;
  producto: { id: number; nombre: string; sap?: string };
}

export interface DesasignacionDetailResource {
  id: number;
  numero: string;
  fecha: string;
  observaciones: string | null;
  tecnico: DesasignacionTecnicoResource;
  almacen?: AlmacenResource;
  usuario?: UsuariosResource;
  series: DesasignacionSerieDetalleResource[];
  materiales: DesasignacionMaterialDetalleResource[];
  deleted_at?: string | null;
}

// ── Creación ──────────────────────────────────────────────────────────────

export interface DesasignacionMaterialBody {
  producto_id: number;
  cantidad: number;
}

export interface DesasignacionCreateBody {
  tecnico_id: number;
  series?: number[];
  materiales?: DesasignacionMaterialBody[];
  observaciones?: string;
}
