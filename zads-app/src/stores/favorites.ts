import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { Favorite, Teacher } from "@/types";

interface FavoritesStore {
  data: Favorite[] | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addFavorite: (teacherId: string) => Promise<void>;
  removeFavorite: (teacherId: string) => Promise<void>;
  isFavorite: (teacherId: string) => boolean;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  devtools(
    (set, get) => ({
      ...initialSlice<Favorite[]>(),

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: Favorite[] }>("/favorites");
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      addFavorite: async (teacherId) => {
        try {
          await api.post("/favorites", { teacherId });
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      removeFavorite: async (teacherId) => {
        try {
          await api.delete(`/favorites/${teacherId}`);
          set((s) => ({
            data: s.data?.filter((f) => f.teacherId !== teacherId) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      isFavorite: (teacherId) =>
        get().data?.some((f) => f.teacherId === teacherId) ?? false,

      reset: () => set(initialSlice<Favorite[]>()),
    }),
    { name: "favorites-store" }
  )
);
