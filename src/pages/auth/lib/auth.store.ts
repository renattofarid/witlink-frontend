import { create } from "zustand";
import { authenticate, logout as logoutAction } from "./auth.actions";
import type { AuthUsuario } from "./auth.interface";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: AuthUsuario | null;
  message: string | null;
  allowedRoutes: string[];
  almacen_id: number | null;
  setToken: (token: string) => void;
  setUser: (user: AuthUsuario) => void;
  setMessage: (message: string) => void;
  setAllowedRoutes: (routes: string[]) => void;
  setAlmacenId: (id: number) => void;
  authenticate: () => Promise<void>;
  logout: () => void;
}

const storedRoutes = localStorage.getItem("allowedRoutes");
const storedAlmacenId = localStorage.getItem("almacen_id");

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  message: localStorage.getItem("message"),
  allowedRoutes: storedRoutes ? JSON.parse(storedRoutes) : [],
  almacen_id: storedAlmacenId ? Number(storedAlmacenId) : null,
  person: null,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  setMessage: (message) => {
    localStorage.setItem("message", message);
    set({ message });
  },

  setAllowedRoutes: (routes) => {
    localStorage.setItem("allowedRoutes", JSON.stringify(routes));
    set({ allowedRoutes: routes });
  },

  setAlmacenId: (id) => {
    localStorage.setItem("almacen_id", String(id));
    set({ almacen_id: id });
  },

  authenticate: async () => {
    const { data } = await authenticate();
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
      set({
        user: data,
        isAuthenticated: true,
      });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      localStorage.removeItem("allowedRoutes");
      set({
        user: undefined,
        token: undefined,
        isAuthenticated: false,
        allowedRoutes: [],
      });
    }
  },

  logout: async () => {
    await logoutAction();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("message");
    localStorage.removeItem("access");
    localStorage.removeItem("allowedRoutes");
    localStorage.removeItem("almacen_id");
    set({ token: null, user: null, message: null, allowedRoutes: [], almacen_id: null });
  },
}));
