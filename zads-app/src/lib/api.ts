import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const api = axios.create({
  // Use relative /api so it correctly uses the browser's current host/port (e.g. localhost:3001) for the proxy
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Public discovery must not depend on a session or inherit account-specific filters.
export const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 15000,
});

// Request interceptor: attach JWT from NextAuth session
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.apiToken) {
    config.headers.Authorization = `Bearer ${session.apiToken}`;
  }
  return config;
});

// Response interceptor: handle 401 → sign out
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: true, callbackUrl: "/en/auth/login" });
    }
    return Promise.reject(error);
  }
);

export default api;

// Typed helpers
export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, data?: unknown) =>
  api.post<T>(url, data).then((r) => r.data);

export const apiPut = <T>(url: string, data?: unknown) =>
  api.put<T>(url, data).then((r) => r.data);

export const apiPatch = <T>(url: string, data?: unknown) =>
  api.patch<T>(url, data).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);
