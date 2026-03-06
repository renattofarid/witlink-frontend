import { create } from "zustand";
import { authenticate, logout as logoutAction } from "./auth.actions";
import type { AuthUsuario } from "./auth.interface";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: AuthUsuario | null;
  message: string | null;
  setToken: (token: string) => void;
  setUser: (user: AuthUsuario) => void;
  setMessage: (message: string) => void;
  authenticate: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  message: localStorage.getItem("message"),
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
      set({
        user: undefined,
        token: undefined,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    await logoutAction();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("message");
    localStorage.removeItem("access");
    set({ token: null, user: null, message: null });
  },
}));
