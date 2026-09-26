import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { TeacherSubject } from "@/types";

interface AddSubjectPayload {
  subjectId: string;
  stageId: string;
  priceOnline?: number | null;
  priceOffline?: number | null;
  priceAtTeacher?: number | null;
  priceAtStudent?: number | null;
  priceGroup?: number | null;
  priceNegotiable?: boolean;
  isOnline?: boolean;
  isOffline?: boolean;
  durationMinutes?: number;
}

interface TeacherSubjectsStore {
  data: TeacherSubject[] | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addSubject: (payload: AddSubjectPayload) => Promise<void>;
  updateSubject: (id: string, payload: Partial<AddSubjectPayload & { isActive?: boolean }>) => Promise<void>;
  reset: () => void;
}

export const useTeacherSubjectsStore = create<TeacherSubjectsStore>()(
  devtools(
    (set, get) => ({
      ...initialSlice<TeacherSubject[]>(),

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: TeacherSubject[] }>("/teachers/me/subjects");
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      addSubject: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/teachers/me/subjects", payload);
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      updateSubject: async (id, payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.put(`/teachers/me/subjects/${id}`, payload);
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      reset: () => set(initialSlice<TeacherSubject[]>()),
    }),
    { name: "teacher-subjects-store" }
  )
);
