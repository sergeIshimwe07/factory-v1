import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import api from "./api";
import type { User, LoginCredentials, LoginResponse } from "@/types";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<LoginResponse>("/auth/login", credentials);
          Cookies.set("accessToken", data.data.accessToken, { expires: 1 });
          Cookies.set("refreshToken", data.data.refreshToken, { expires: 7 });
          set({ user: data.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        localStorage.clear();
        set({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      checkAuth: async () => {
        const token = Cookies.get("accessToken");
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const { data } = await api.get<User>("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        // After hydration, verify token exists to sync auth state
        if (state) {
          const hasToken = typeof window !== "undefined" && Cookies.get("accessToken");
          if (!hasToken && state.isAuthenticated) {
            state.isAuthenticated = false;
            state.user = null;
          } else if (hasToken && !state.isAuthenticated && state.user) {
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
);
