export interface AuthResponse {
  message: string;
  data: AuthResource;
}

export interface AuthResource {
  usuario: AuthUsuario;
  token: string;
}

export interface AuthUsuario {
  id: number;
  persona_id: number;
  tipo_usuario_id: number;
  oficina_id: number;
  nombre_usuario: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
