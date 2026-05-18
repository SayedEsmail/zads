import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { ClientProfile, ClientAccountKind } from "@/types";

interface ClientStore {
  data: ClientProfile | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  updateProfile: (payload: { areaId?: string; clientAccountKind?: ClientAccountKind }) => Promise<void>;
  reset: () => void;
}

export const useClientStore = create<ClientStore>()(
  devtools(
    (set) => ({
      ...initialSlice<ClientProfile>(),

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: { parent: ClientProfile } }>("/parents/me");
          set({ data: res.data.data.parent, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put<{ data: ClientProfile }>("/parents/me", payload);
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      reset: () => set(initialSlice<ClientProfile>()),
    }),
    { name: "client-store" }
  )
);
