import { create } from "zustand";
import { authenticate, logout as logoutAction } from "./auth.actions";
import type { AuthUsuario } from "./auth.interface";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: AuthUsuario | null;
  message: string | null;
  allowedRoutes: string[];
  setToken: (token: string) => void;
  setUser: (user: AuthUsuario) => void;
  setMessage: (message: string) => void;
  setAllowedRoutes: (routes: string[]) => void;
  authenticate: () => void;
  logout: () => void;
}

const storedRoutes = localStorage.getItem("allowedRoutes");

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  message: localStorage.getItem("message"),
  allowedRoutes: storedRoutes ? JSON.parse(storedRoutes) : [],
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
    set({ token: null, user: null, message: null, allowedRoutes: [] });
  },
}));
