import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { TutorRequest, RequestTarget, StudyMode, LessonType } from "@/types";

interface CreateTutorRequestPayload {
  subjectId: string;
  stageId: string;
  description?: string;
  requestTarget: RequestTarget;
  studyMode: StudyMode;
  parentChildId?: string;
  preferredLessonType?: LessonType;
  budgetMin?: number;
  budgetMax?: number;
}

interface TutorRequestsStore {
  data: TutorRequest[] | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  createRequest: (payload: CreateTutorRequestPayload) => Promise<void>;
  closeRequest: (id: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  reset: () => void;
}

export const useTutorRequestsStore = create<TutorRequestsStore>()(
  devtools(
    (set, get) => ({
      ...initialSlice<TutorRequest[]>(),

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: TutorRequest[] }>("/tutor-requests/my");
          set({ data: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      createRequest: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/tutor-requests", payload);
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      closeRequest: async (id) => {
        try {
          await api.patch(`/tutor-requests/${id}/close`);
          set((s) => ({
            data: s.data?.map((r) => r.id === id ? { ...r, status: "closed" as const } : r) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      deleteRequest: async (id) => {
        try {
          await api.delete(`/tutor-requests/${id}`);
          set((s) => ({ data: s.data?.filter((r) => r.id !== id) ?? null }));
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      reset: () => set(initialSlice<TutorRequest[]>()),
    }),
    { name: "tutor-requests-store" }
  )
);
