import { useAuthStore } from "./auth.store";
import type { AuthResponse, AuthUsuario } from "./auth.interface";
import { api } from "@/lib/config";

// Define el tipo para los datos de inicio de sesión
export interface LoginBody {
  nombre_usuario: string;
  contraseña: string;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", body);

    const { setToken, setUser } = useAuthStore.getState();

    setToken(data.data.token);
    setUser(data.data.usuario);

    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

export async function authenticate(): Promise<AuthUsuario> {
  try {
    const { data } = await api.get<AuthUsuario>("/auth/me");
    const { setUser } = useAuthStore.getState();

    setUser(data);

    return data;
  } catch (error) {
    console.error("Error en authenticate:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const { token, clearAuth } = useAuthStore.getState();
    if (!token) throw new Error("Token no disponible");

    // await api.get("/logout", {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    clearAuth();
  } catch (error) {
    console.error("Error en logout:", error);
    throw error;
  }
}

export async function updateEmail(newEmail: string): Promise<void> {
  try {
    await api.post("/confirmEmail", { email: newEmail });
  } catch (error) {
    console.error("Error en updateEmail:", error);
    throw error;
  }
}
