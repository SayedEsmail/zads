import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getSession, signIn, signOut } from "next-auth/react";
import api from "@/lib/api";
import { extractError, initialSlice } from "./_convention";
import type {
  User,
  ClientProfile,
  RegisterClientPayload,
  RegisterTeacherPayload,
} from "@/types";

interface AuthState {
  // Profile data
  profile: (User & { parent?: ClientProfile }) | null;
  isLoading: boolean;
  error: string | null;
  registrationComplete: boolean;

  // Actions
  login: (phone: string, password: string, email?: string) => Promise<string | null>;
  registerClient: (payload: RegisterClientPayload) => Promise<boolean>;
  registerTeacher: (payload: RegisterTeacherPayload) => Promise<boolean>;
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
      registrationComplete: false,

      login: async (phone, password, email) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signIn("credentials", {
            phone: phone || undefined,
            email: email || undefined,
            password,
            redirect: false,
          });
          if (result?.error) {
            set({ error: "Invalid phone or password", isLoading: false });
            return null;
          } else {
            const session = await getSession();
            set({ isLoading: false });
            return session?.userType ?? null;
          }
        } catch (err) {
          console.error("[AUTH DEBUG] login error:", err);
          set({ error: extractError(err), isLoading: false });
          return null;
        }
      },

      registerClient: async (payload) => {
        set({ isLoading: true, error: null, registrationComplete: false });
        try {
          await api.post("/auth/register/parent", payload);
          const result = await signIn("credentials", {
            phone: payload.phone,
            password: payload.password,
            redirect: false,
          });
          const session = result?.error ? null : await getSession();
          if (session?.userType !== "parent") {
            set({
              isLoading: false,
              registrationComplete: true,
              error: "Your account was created, but automatic sign-in failed. Please sign in.",
            });
            return false;
          }
          set({ isLoading: false, registrationComplete: true });
          return true;
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      registerTeacher: async (payload) => {
        set({ isLoading: true, error: null, registrationComplete: false });
        try {
          await api.post("/auth/register/teacher", payload);
          const result = await signIn("credentials", {
            phone: payload.phone,
            password: payload.password,
            redirect: false,
          });
          const session = result?.error ? null : await getSession();
          if (session?.userType !== "teacher") {
            set({
              isLoading: false,
              registrationComplete: true,
              error: "Your account was created, but automatic sign-in failed. Please sign in.",
            });
            return false;
          }
          set({ isLoading: false, registrationComplete: true });
          return true;
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
          set({ profile: res.data.data.user, isLoading: false });
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
          await get().updateAccount({ avatarUrl: res.data.data.url });
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
          set({ profile: res.data.data.user, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      reset: () => set({ profile: null, isLoading: false, error: null, registrationComplete: false }),
    }),
    { name: "auth-store" }
  )
);
