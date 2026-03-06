import { useAuthStore } from "./auth.store";
import type { AuthenticateResponse, AuthResponse } from "./auth.interface";
import { api } from "@/lib/config";

export interface LoginBody {
  nombre_usuario: string;
  contraseña: string;
}

async function loadAllowedRoutes(tipoUsuarioId: number): Promise<void> {
  try {
    const { data } = await api.get(`/tipos-usuario/${tipoUsuarioId}/opciones-menu`);
    const routes: string[] = (data as { ruta: string }[]).map((o) => o.ruta);
    useAuthStore.getState().setAllowedRoutes(routes);
  } catch {
    // Si falla, se deja el arreglo vacío
  }
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", body);

    const { setToken, setUser } = useAuthStore.getState();

    setToken(data.data.token);
    setUser(data.data.usuario);

    await loadAllowedRoutes(data.data.usuario.tipo_usuario_id);

    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

export async function authenticate(): Promise<AuthenticateResponse> {
  try {
    const { data } = await api.get<AuthenticateResponse>("/auth/me");
    const { setUser } = useAuthStore.getState();

    setUser(data.data);

    await loadAllowedRoutes(data.data.tipo_usuario_id);

    return data;
  } catch (error) {
    console.error("Error en authenticate:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function updateEmail(newEmail: string): Promise<void> {
  try {
    await api.post("/confirmEmail", { email: newEmail });
  } catch (error) {
    console.error("Error en updateEmail:", error);
    throw error;
  }
}
