import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { AdminTeacher, AdminParent, Subject, Stage } from "@/types";

interface AdminDashboardStats {
  teachers: {
    total: number;
    active: number;
    newLast7Days: number;
  };
  parents: {
    total: number;
    newLast7Days: number;
  };
  contactRequests: {
    total: number;
    pending: number;
  };
}

interface AdminStore {
  teachers: AdminTeacher[];
  totalTeachers: number;
  parents: AdminParent[];
  totalParents: number;
  stats: AdminDashboardStats | null;
  stages: Stage[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTeachers: (params?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<void>;
  fetchParents: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  toggleTeacherVerification: (teacherId: string, isVerified: boolean) => Promise<void>;
  updateUserStatus: (userId: string, status: "active" | "suspended") => Promise<void>;
  fetchStages: () => Promise<void>;
  createStage: (payload: { nameAr: string; nameEn?: string; sortOrder: number }) => Promise<void>;
  updateStage: (id: string, payload: { nameAr?: string; nameEn?: string; sortOrder?: number; isActive?: boolean }) => Promise<void>;
  fetchSubjects: () => Promise<void>;
  createSubject: (payload: { nameAr: string; nameEn?: string; icon?: string; sortOrder: number }) => Promise<void>;
  updateSubject: (id: string, payload: { nameAr?: string; nameEn?: string; icon?: string; sortOrder?: number; isActive?: boolean }) => Promise<void>;
  reset: () => void;
}

export const useAdminStore = create<AdminStore>()(
  devtools(
    (set, get) => ({
      ...initialSlice<null>(),
      teachers: [],
      totalTeachers: 0,
      parents: [],
      totalParents: 0,
      stats: null,
      stages: [],
      subjects: [],

      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: AdminDashboardStats }>("/admin/dashboard");
          set({ stats: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchTeachers: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const query = new URLSearchParams();
          if (params?.page) query.append("page", params.page.toString());
          if (params?.limit) query.append("limit", params.limit.toString());
          if (params?.status) query.append("status", params.status);
          if (params?.search) query.append("search", params.search);

          const res = await api.get<{ data: AdminTeacher[]; meta: { total: number } }>(`/admin/teachers?${query.toString()}`);
          set({ teachers: res.data.data, totalTeachers: res.data.meta.total, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchParents: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const query = new URLSearchParams();
          if (params?.page) query.append("page", params.page.toString());
          if (params?.limit) query.append("limit", params.limit.toString());
          if (params?.search) query.append("search", params.search);

          const res = await api.get<{ data: AdminParent[]; meta: { total: number } }>(`/admin/parents?${query.toString()}`);
          set({ parents: res.data.data, totalParents: res.data.meta.total, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      toggleTeacherVerification: async (teacherId, isVerified) => {
        set({ isLoading: true, error: null });
        try {
          await api.patch(`/admin/teachers/${teacherId}/verify`, { isVerified });
          // Update local state list to avoid full reload
          const currentTeachers = get().teachers;
          set({
            teachers: currentTeachers.map((t) => (t.id === teacherId ? { ...t, isVerified } : t)),
            isLoading: false,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      updateUserStatus: async (userId, status) => {
        set({ isLoading: true, error: null });
        try {
          await api.patch(`/admin/users/${userId}/status`, { status });
          // Update local state list for both teachers and parents to avoid full reload
          const currentTeachers = get().teachers;
          const currentParents = get().parents;

          set({
            teachers: currentTeachers.map((t) =>
              t.user?.id === userId ? { ...t, user: { ...t.user, status } } : t
            ),
            parents: currentParents.map((p) =>
              p.user?.id === userId ? { ...p, user: { ...p.user, status } } : p
            ),
            isLoading: false,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      fetchStages: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: Stage[] }>("/stages?includeInactive=true");
          set({ stages: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      createStage: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/stages", payload);
          await get().fetchStages();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      updateStage: async (id, payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.put(`/stages/${id}`, payload);
          await get().fetchStages();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      fetchSubjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: Subject[] }>("/subjects?includeInactive=true");
          set({ subjects: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      createSubject: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/subjects", payload);
          await get().fetchSubjects();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      updateSubject: async (id, payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.put(`/subjects/${id}`, payload);
          await get().fetchSubjects();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      reset: () =>
        set({
          ...initialSlice<null>(),
          teachers: [],
          totalTeachers: 0,
          parents: [],
          totalParents: 0,
          stats: null,
          stages: [],
          subjects: [],
        }),
    }),
    { name: "admin-store" }
  )
);
