import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError } from "./_convention";
import type { ContactRequest, ContactRequestStatus } from "@/types";

interface ContactRequestsStore {
  // Client's sent requests
  sent: ContactRequest[] | null;
  // Teacher's received requests
  incoming: ContactRequest[] | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  fetchIncoming: () => Promise<void>;
  createRequest: (payload: { teacherId: string; subjectId?: string; stageId?: string; message?: string }) => Promise<void>;
  updateStatus: (id: string, status: ContactRequestStatus, replyMessage?: string) => Promise<void>;
  updateParentStatus: (id: string, status: ContactRequestStatus, replyMessage?: string) => Promise<void>;
  updateParentMessage: (id: string, message: string) => Promise<void>;
  reset: () => void;
}

export const useContactRequestsStore = create<ContactRequestsStore>()(
  devtools(
    (set, get) => ({
      sent: null,
      incoming: null,
      isLoading: false,
      error: null,

      fetch: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: ContactRequest[] }>("/contact-requests/my");
          set({ sent: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      fetchIncoming: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.get<{ data: ContactRequest[] }>("/contact-requests/incoming");
          set({ incoming: res.data.data, isLoading: false });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
        }
      },

      createRequest: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/contact-requests", payload);
          await get().fetch();
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }
      },

      updateStatus: async (id, status, replyMessage) => {
        try {
          await api.patch(`/contact-requests/${id}/status`, { status, replyMessage });
          set((s) => ({
            incoming:
              s.incoming?.map((r) =>
                r.id === id ? { ...r, status, replyMessage: replyMessage !== undefined ? replyMessage : r.replyMessage } : r
              ) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      updateParentStatus: async (id, status, replyMessage) => {
        try {
          await api.patch(`/contact-requests/parent/${id}/status`, { status, replyMessage });
          set((s) => ({
            sent:
              s.sent?.map((r) =>
                r.id === id ? { ...r, status, replyMessage: replyMessage !== undefined ? replyMessage : r.replyMessage } : r
              ) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      updateParentMessage: async (id, message) => {
        try {
          await api.patch(`/contact-requests/${id}`, { message });
          set((s) => ({
            sent:
              s.sent?.map((r) =>
                r.id === id ? { ...r, message } : r
              ) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
        }
      },

      reset: () => set({ sent: null, incoming: null, isLoading: false, error: null }),
    }),
    { name: "contact-requests-store" }
  )
);
