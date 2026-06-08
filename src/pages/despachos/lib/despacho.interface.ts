import type { PaginationResponse } from "@/lib/core.interface";
import type { AlmacenResource } from "@/pages/auth/lib/auth.interface";
import type {
  PersonaResource,
  UsuariosResource,
} from "@/pages/usuarios/lib/usuarios.interface";

export interface DespachoResource {
  id: number;
  numero: string;
  fecha: string;
  almacen: AlmacenResource;
  usuario: UsuariosResource;
  tecnico: PersonaResource;
  productos: DespachoProductoDetalleResource[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// ── Tipos anidados para la vista de detalle ──────────────────────────────────

export interface DespachoPersonaResource {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string;
}

export interface DespachoUsuarioResource {
  id: number;
  nombre_usuario: string;
  persona: DespachoPersonaResource | null;
}

export interface DespachoTecnicoResource {
  id: number;
  persona: DespachoPersonaResource | null;
}

export interface DespachoAlmacenResource {
  id: number;
  nombre: string;
  direccion: string | null;
}

export interface DespachoSerieDetalleResource {
  id: number;
  serie: string;
  situacion: string;
  mac: string | null;
  emta_mac: string | null;
  ua: string | null;
}

export interface DespachoProductoDetalleResource {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    sap: string;
    tipo: string | null;
    origen: string | null;
  };
  series: Array<{ serie: DespachoSerieDetalleResource | null }>;
}

export type DespachoResponse = PaginationResponse<DespachoResource>;

export interface DespachoSerieBody {
  serie: string;
}

export interface DespachoProductoBody {
  id: number;
  cantidad: number;
  series: DespachoSerieBody[];
}

export interface DespachoCreateBody {
  tecnico_id: number;
  productos: DespachoProductoBody[];
}

export interface DespachoMasivoSeriesBody {
  tecnico_id: number;
  series: string[];
}

export interface MasivoSerieValidadaItem {
  id: number;
  serie: string;
  producto_id: number;
  producto_nombre: string;
  producto_sap: string;
  producto_tipo: string;
}

export interface MasivoSerieValidacionResponse {
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
