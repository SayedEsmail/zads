import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { Dependent } from "@/types";

interface DependentsStore {
  data: Dependent[] | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (payload: { name: string; stageId: string; subjectIds?: string[] }) => Promise<void>;
  update: (id: string, payload: { name?: string; stageId?: string; subjectIds?: string[] }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useDependentsStore = create<DependentsStore>()(
  devtools(
    (set, get) => ({
      ...initialSlice<Dependent[]>(),

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: Dependent[] }>("/parents/me/children");
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      add: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/parents/me/children", payload);
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      update: async (id, payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.put(`/parents/me/children/${id}`, payload);
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      remove: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/parents/me/children/${id}`);
          set((s) => ({
            data: s.data?.filter((d) => d.id !== id) ?? null,
            isLoading: false,
          }));
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      reset: () => set(initialSlice<Dependent[]>()),
    }),
    { name: "dependents-store" }
  )
);
