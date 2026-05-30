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
  updateProfile: (payload: Partial<Pick<Teacher, "bio" | "experienceYears" | "qualification" | "areaId" | "lessonTypes" | "certificateUrl">>) => Promise<void>;
  uploadCertificate: (file: File) => Promise<void>;
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
          const res = await api.get<{ data: { teacher: Teacher } }>("/teachers/me");
          set({ data: res.data.data.teacher, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchStats: async () => {
        try {
          const res = await api.get<{ data: TeacherStats }>("/teachers/me/stats");
          set({ stats: res.data.data });
        } catch { /* silent */ }
      },

      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put<{ data: Teacher }>("/teachers/me", payload);
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      uploadCertificate: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append("certificate", file);
          const res = await api.post<{ data: { url: string } }>("/upload/certificate", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          
          // Save the URL to the teacher profile
          await api.put<{ data: Teacher }>("/teachers/me", { certificateUrl: res.data.data.url });
          
          // Re-fetch to guarantee session sync
          const resUpdated = await api.get<{ data: { teacher: Teacher } }>("/teachers/me");
          set({ data: resUpdated.data.data.teacher, isLoading: false });
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
