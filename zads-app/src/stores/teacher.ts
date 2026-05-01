import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { Teacher } from "@/types";

interface TeacherStats {
  views: number;
  rating: number;
  ratingCount: number;
  contactRequests: number;
}

interface TeacherStore {
  data: Teacher | null;
  stats: TeacherStats | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<Teacher, "bio" | "experienceYears" | "qualification" | "areaId" | "lessonTypes">>) => Promise<void>;
  reset: () => void;
}

export const useTeacherStore = create<TeacherStore>()(
  devtools(
    (set) => ({
      ...initialSlice<Teacher>(),
      stats: null,

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: { teacher: Teacher } }>("/teachers/profile");
          set({ data: res.data.data.teacher, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchStats: async () => {
        try {
          const res = await api.get<{ data: TeacherStats }>("/teachers/stats");
          set({ stats: res.data.data });
        } catch { /* silent */ }
      },

      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put<{ data: Teacher }>("/teachers/profile", payload);
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      reset: () => set({ ...initialSlice<Teacher>(), stats: null }),
    }),
    { name: "teacher-store" }
  )
);
