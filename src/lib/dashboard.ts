import { create } from "zustand";
import api from "./api";
import type { DashboardSummary } from "@/types";

interface DashboardStore {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  reset: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: false, error: null });
    try {
      const { data } = await api.get<DashboardSummary>("/dashboard/summary");
      set({ summary: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch dashboard data";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  reset: () => {
    set({ summary: null, isLoading: false, error: null });
  },
}));
