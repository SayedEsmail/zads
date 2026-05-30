import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { TeacherAvailability } from "@/types";

interface AvailabilitySlotPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface TeacherAvailabilityStore {
  data: TeacherAvailability[] | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  updateAvailability: (slots: AvailabilitySlotPayload[]) => Promise<void>;
  reset: () => void;
}

export const useTeacherAvailabilityStore = create<TeacherAvailabilityStore>()(
  devtools(
    (set) => ({
      ...initialSlice<TeacherAvailability[]>(),

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: TeacherAvailability[] }>("/teachers/me/availability");
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      updateAvailability: async (slots) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put<{ data: TeacherAvailability[] }>("/teachers/me/availability", { slots });
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      reset: () => set(initialSlice<TeacherAvailability[]>()),
    }),
    { name: "teacher-availability-store" }
  )
);
