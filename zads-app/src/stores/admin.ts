import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type { AdminTeacher, AdminParent, AdminContactRequest, Subject, Stage, PaginatedResponse, UserStatus } from "@/types";

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
  teachersPage: number;
  teachersLimit: number;
  teachersTotalPages: number;

  parents: AdminParent[];
  totalParents: number;
  parentsPage: number;
  parentsLimit: number;
  parentsTotalPages: number;

  contactRequests: AdminContactRequest[];
  totalContactRequests: number;
  contactRequestsPage: number;
  contactRequestsLimit: number;
  contactRequestsTotalPages: number;

  stats: AdminDashboardStats | null;
  stages: Stage[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTeachers: (params?: { page?: number; limit?: number; status?: string; search?: string; isVerified?: boolean; areaId?: string }) => Promise<void>;
  fetchParents: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  fetchContactRequests: (params?: { page?: number; limit?: number; status?: string; search?: string; startDate?: string; endDate?: string; initiatedBy?: string }) => Promise<void>;
  toggleTeacherVerification: (teacherId: string, isVerified: boolean, notes?: string) => Promise<void>;
  updateUserStatus: (userId: string, status: "active" | "suspended") => Promise<void>;
  updateUser: (userId: string, payload: { name?: string; phone?: string; email?: string | null; password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
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
      teachersPage: 1,
      teachersLimit: 20,
      teachersTotalPages: 1,

      parents: [],
      totalParents: 0,
      parentsPage: 1,
      parentsLimit: 20,
      parentsTotalPages: 1,

      contactRequests: [],
      totalContactRequests: 0,
      contactRequestsPage: 1,
      contactRequestsLimit: 20,
      contactRequestsTotalPages: 1,

      stats: null,
      stages: [],
      subjects: [],

      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: AdminDashboardStats }>("/admin/dashboard");
          set({ stats: res.data.data, isLoading: false, error: null });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchTeachers: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const page = params?.page ?? 1;
          const limit = params?.limit ?? 20;
          const query = new URLSearchParams();
          query.append("page", page.toString());
          query.append("limit", limit.toString());
          if (params?.status) query.append("status", params.status);
          if (params?.search) query.append("search", params.search);
          if (params?.isVerified !== undefined) query.append("isVerified", String(params.isVerified));
          if (params?.areaId) query.append("areaId", params.areaId);

          const res = await api.get<PaginatedResponse<AdminTeacher>>(`/admin/teachers?${query.toString()}`);
          const pagination = res.data.pagination || (res.data as unknown as { meta?: { total: number } })?.meta || {
            page,
            limit,
            total: res.data.data?.length || 0,
            totalPages: Math.ceil((res.data.data?.length || 0) / limit) || 1,
          };

          const total = typeof pagination.total === "number" ? pagination.total : (res.data.data?.length || 0);
          const totalPages = "totalPages" in pagination ? pagination.totalPages : Math.ceil(total / limit) || 1;

          set({
            teachers: res.data.data || [],
            totalTeachers: total,
            teachersPage: "page" in pagination ? pagination.page : page,
            teachersLimit: "limit" in pagination ? pagination.limit : limit,
            teachersTotalPages: totalPages,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchParents: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const page = params?.page ?? 1;
          const limit = params?.limit ?? 20;
          const query = new URLSearchParams();
          query.append("page", page.toString());
          query.append("limit", limit.toString());
          if (params?.search) query.append("search", params.search);

          const res = await api.get<PaginatedResponse<AdminParent>>(`/admin/parents?${query.toString()}`);
          const pagination = res.data.pagination || (res.data as unknown as { meta?: { total: number } })?.meta || {
            page,
            limit,
            total: res.data.data?.length || 0,
            totalPages: Math.ceil((res.data.data?.length || 0) / limit) || 1,
          };

          const total = typeof pagination.total === "number" ? pagination.total : (res.data.data?.length || 0);
          const totalPages = "totalPages" in pagination ? pagination.totalPages : Math.ceil(total / limit) || 1;

          set({
            parents: res.data.data || [],
            totalParents: total,
            parentsPage: "page" in pagination ? pagination.page : page,
            parentsLimit: "limit" in pagination ? pagination.limit : limit,
            parentsTotalPages: totalPages,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchContactRequests: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const page = params?.page ?? 1;
          const limit = params?.limit ?? 20;
          const query = new URLSearchParams();
          query.append("page", page.toString());
          query.append("limit", limit.toString());
          if (params?.status) query.append("status", params.status);
          if (params?.search) query.append("search", params.search);
          if (params?.startDate) query.append("startDate", params.startDate);
          if (params?.endDate) query.append("endDate", params.endDate);
          if (params?.initiatedBy) query.append("initiatedBy", params.initiatedBy);

          const res = await api.get<PaginatedResponse<AdminContactRequest>>(`/admin/contact-requests?${query.toString()}`);
          const pagination = res.data.pagination || (res.data as unknown as { meta?: { total: number } })?.meta || {
            page,
            limit,
            total: res.data.data?.length || 0,
            totalPages: Math.ceil((res.data.data?.length || 0) / limit) || 1,
          };

          const total = typeof pagination.total === "number" ? pagination.total : (res.data.data?.length || 0);
          const totalPages = "totalPages" in pagination ? pagination.totalPages : Math.ceil(total / limit) || 1;

          set({
            contactRequests: res.data.data || [],
            totalContactRequests: total,
            contactRequestsPage: "page" in pagination ? pagination.page : page,
            contactRequestsLimit: "limit" in pagination ? pagination.limit : limit,
            contactRequestsTotalPages: totalPages,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      toggleTeacherVerification: async (teacherId, isVerified, notes) => {
        set({ isLoading: true, error: null });
        try {
          await api.patch(`/admin/teachers/${teacherId}/verify`, { isVerified, verificationNotes: notes });
          const currentTeachers = get().teachers;
          set({
            teachers: currentTeachers.map((t) => (t.id === teacherId ? { ...t, isVerified } : t)),
            isLoading: false,
            error: null,
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
            error: null,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      updateUser: async (userId, payload) => {
        set({ error: null });
        try {
          const res = await api.put<{ data: { id: string; name: string; phone: string; email: string | null; status: string; userType: string; avatarUrl: string | null } }>(
            `/admin/users/${userId}`,
            payload
          );
          const updated = res.data.data;
          set({
            teachers: get().teachers.map((t) =>
              t.user?.id === userId
                ? {
                    ...t,
                    user: {
                      ...t.user,
                      name: updated.name,
                      phone: updated.phone,
                      email: updated.email,
                      status: updated.status as UserStatus,
                      avatarUrl: updated.avatarUrl,
                    },
                  }
                : t
            ),
            parents: get().parents.map((p) =>
              p.user?.id === userId
                ? {
                    ...p,
                    user: {
                      ...p.user,
                      name: updated.name,
                      phone: updated.phone,
                      email: updated.email,
                      status: updated.status as UserStatus,
                      avatarUrl: updated.avatarUrl,
                    },
                  }
                : p
            ),
            error: null,
          });
        } catch (err) {
          set({ error: extractError(err) });
          throw err;
        }
      },

      deleteUser: async (userId) => {
        set({ error: null });
        try {
          const wasTeacher = get().teachers.some((t) => t.user?.id === userId);
          const wasParent = get().parents.some((p) => p.user?.id === userId);
          await api.delete(`/admin/users/${userId}`);
          set({
            teachers: get().teachers.filter((t) => t.user?.id !== userId),
            totalTeachers: wasTeacher ? Math.max(0, get().totalTeachers - 1) : get().totalTeachers,
            parents: get().parents.filter((p) => p.user?.id !== userId),
            totalParents: wasParent ? Math.max(0, get().totalParents - 1) : get().totalParents,
            error: null,
          });
        } catch (err) {
          set({ error: extractError(err) });
          throw err;
        }
      },

      fetchStages: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: Stage[] }>("/stages?includeInactive=true");
          set({ stages: res.data.data, isLoading: false, error: null });
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
          set({ subjects: res.data.data, isLoading: false, error: null });
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
          teachersPage: 1,
          teachersLimit: 20,
          teachersTotalPages: 1,
          parents: [],
          totalParents: 0,
          parentsPage: 1,
          parentsLimit: 20,
          parentsTotalPages: 1,
          contactRequests: [],
          totalContactRequests: 0,
          contactRequestsPage: 1,
          contactRequestsLimit: 20,
          contactRequestsTotalPages: 1,
          stats: null,
          stages: [],
          subjects: [],
        }),
    }),
    { name: "admin-store" }
  )
);
