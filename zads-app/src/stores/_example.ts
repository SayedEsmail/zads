/**
 * Example store — copy this pattern when creating any new store.
 *
 * Replace `ExampleItem` with your domain type.
 * Replace `/example` with your API endpoint.
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type StoreSlice, extractError, initialSlice } from "./_convention";
import api from "@/lib/api";

interface ExampleItem {
  id: string;
  name: string;
}

interface ExampleStore extends StoreSlice<ExampleItem[]> {
  // Add any extra actions beyond fetch/reset here
  selectedId: string | null;
  select: (id: string | null) => void;
}

export const useExampleStore = create<ExampleStore>()(
  devtools(
    (set) => ({
      ...initialSlice<ExampleItem[]>(),
      selectedId: null,

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: ExampleItem[] }>("/example");
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      reset: () => set({ ...initialSlice<ExampleItem[]>(), selectedId: null }),

      select: (id) => set({ selectedId: id }),
    }),
    { name: "example-store" }
  )
);
