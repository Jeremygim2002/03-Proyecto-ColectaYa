import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { APP_CONFIG } from "@/constants";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        // Sincronizar con localStorage para httpClient
        localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
        localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        // Limpiar localStorage
        localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
        localStorage.removeItem(APP_CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem(APP_CONFIG.USER_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => {
        localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true });
      },
      updateUser: (updates) =>
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...updates } : null;
          if (updatedUser) {
            localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(updatedUser));
          }
          return { user: updatedUser };
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
