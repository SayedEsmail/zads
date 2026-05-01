import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { signIn, signOut } from "next-auth/react";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type {
  User,
  ClientProfile,
  RegisterClientPayload,
  RegisterTeacherPayload,
  ClientAccountKind,
} from "@/types";

interface AuthState {
  // Profile data
  profile: (User & { parent?: ClientProfile }) | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phone: string, password: string) => Promise<void>;
  registerClient: (payload: RegisterClientPayload) => Promise<void>;
  registerTeacher: (payload: RegisterTeacherPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateAccount: (payload: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      ...initialSlice<null>(),
      profile: null,

      login: async (phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signIn("credentials", {
            phone,
            password,
            redirect: false,
          });
          if (result?.error) {
            set({ error: "Invalid phone or password", isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      registerClient: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/register/parent", payload);
          // After successful registration, sign in
          await signIn("credentials", {
            phone: payload.phone,
            password: payload.password,
            redirect: false,
          });
          set({ isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      registerTeacher: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/register/teacher", payload);
          await signIn("credentials", {
            phone: payload.phone,
            password: payload.password,
            redirect: false,
          });
          set({ isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await signOut({ redirect: false });
        get().reset();
      },

      updateAccount: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put<{ data: { user: User } }>("/auth/profile", payload);
          set({ profile: res.data.data.user as any, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append("image", file);
          const res = await api.post<{ data: { url: string } }>("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          await get().updateAccount({ avatarUrl: res.data.data.url } as any);
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await api.put("/auth/profile", { currentPassword, password: newPassword });
          set({ isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: { user: User } }>("/auth/profile");
          set({ profile: res.data.data.user as any, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      reset: () => set({ profile: null, isLoading: false, error: null }),
    }),
    { name: "auth-store" }
  )
);
