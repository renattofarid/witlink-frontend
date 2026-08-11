export interface AuthResponse {
  message: string;
  data: AuthResource;
}

export interface AuthResource {
  usuario: AuthUsuario;
  token: string;
}

export interface AuthenticateResponse {
  data: AuthUsuario;
}

export interface AuthUsuario {
  id: number;
  nombre_usuario: string;
  persona_id: number;
  almacen_id: number;
  tipo_usuario: TipoUsuario;
  grupos_menu: GruposMenu[];
  is_corporativo: boolean;
}

export interface GruposMenu {
  id: number;
  nombre: string;
  icono: string;
  orden: string;
  opciones_menu: OpcionesMenu[];
}

export interface OpcionesMenu {
  id: number;
  nombre: string;
  ruta: string;
  icono: string;
  orden: string;
}

export interface TipoUsuario {
  id: number;
  nombre: string;
}

export type { AlmacenResource } from "@/pages/almacenes/lib/almacen.interface";
