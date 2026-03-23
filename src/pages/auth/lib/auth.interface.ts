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

interface AuthUsuario {
  id: number;
  nombre_usuario: string;
  persona_id: number;
  oficina_id: number;
  tipo_usuario: TipoUsuario;
  grupos_menu: GruposMenu[];
}

interface GruposMenu {
  id: number;
  nombre: string;
  icono: string;
  orden: string;
  opciones_menu: OpcionesMenu[];
}

interface OpcionesMenu {
  id: number;
  nombre: string;
  ruta: string;
  icono: string;
  orden: string;
}

interface TipoUsuario {
  id: number;
  nombre: string;
}
