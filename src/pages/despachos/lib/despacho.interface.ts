import type { PaginationResponse } from "@/lib/core.interface";
import type { AlmacenResource } from "@/pages/auth/lib/auth.interface";
import type { UsuariosResource } from "@/pages/usuarios/lib/usuarios.interface";

export interface DespachoResource {
  id: number;
  numero: string;
  /** Presente solo en despachos corporativos con SOT asociada. */
  sot: string | null;
  numero_sot?: string | null;
  fecha: string;
  almacen: AlmacenResource;
  usuario: UsuariosResource;
  tecnico: DespachoTecnicoResource;
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
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo: string;
  dni: string;
  carnet_extranjeria: null;
  direccion: string;
  telefono: string;
  correo: string;
  tipo_empleado: string;
  cuadrilla_id: null;
  estado: string;
  created_at: string;
  updated_at: string;
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
  movimiento_id?: number;
  producto: {
    id: number;
    nombre: string;
    sap: string;
    tipo: string | null;
    origen: string | null;
  };
  series: Array<{ serie: DespachoSerieDetalleResource | null }>;
}

export interface DespachoDetailResource {
  id: number;
  numero: string;
  fecha: string;
  almacen_id: number;
  almacen: DespachoAlmacenResource;
  tecnico_id: number;
  tecnico: DespachoTecnicoResource;
  usuario: DespachoUsuarioResource;
  productos: DespachoProductoDetalleResource[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  sot?: string;
  almacen_id?: number;
  productos?: DespachoProductoBody[];
  series?: string[];
}

export interface MasivoSerieValidadaItem {
  id: number;
  serie: string;
  producto_id: number;
  producto_nombre: string;
  producto_sap: string;
  producto_tipo: string;
}

export interface ReasignarTecnicoResponse {
  message: string;
  data: {
    id: number;
    numero: string;
    tecnico: {
      id: number;
      nombres: string;
      apellidos: string;
    };
  };
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
