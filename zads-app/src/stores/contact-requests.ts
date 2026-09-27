import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "@/lib/api";
import { extractError } from "./_convention";
import { trackEvent } from "@/lib/analytics";
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
  createRequest: (payload: {
    teacherId: string;
    subjectId?: string;
    stageId?: string;
    message?: string;
    studyMode?: "online" | "offline";
    teachingPlace?: string;
    preferredTime?: string;
    tutorRequestId?: string;
    idempotencyKey?: string;
  }) => Promise<void>;
  createRequestAsTeacher: (payload: {
    parentId: string;
    subjectId?: string;
    stageId?: string;
    message?: string;
    studyMode?: "online" | "offline";
    teachingPlace?: string;
    preferredTime?: string;
    tutorRequestId: string;
    idempotencyKey?: string;
  }) => Promise<void>;
  updateStatus: (id: string, status: ContactRequestStatus, replyMessage?: string) => Promise<void>;
  updateParentStatus: (id: string, status: ContactRequestStatus, replyMessage?: string) => Promise<void>;
  updateParentMessage: (id: string, message: string) => Promise<void>;
  reset: () => void;
}

export const useContactRequestsStore = create<ContactRequestsStore>()(
  devtools(
    (set, get) => {
      // Reuse a key while an identical submit is pending so a lost response can
      // be retried safely. A successful submit clears it for the next intent.
      const pendingIntentKeys = new Map<string, string>();
      const keyForIntent = (prefix: string, payload: object) => {
        const intent = `${prefix}:${JSON.stringify(payload)}`;
        let key = pendingIntentKeys.get(intent);
        if (!key) {
          key = `${prefix}_${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
          pendingIntentKeys.set(intent, key);
        }
        return { intent, key };
      };

      return ({
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
        const { intent, key: generatedKey } = keyForIntent("cr_p", payload);
        const idempotencyKey = payload.idempotencyKey || generatedKey;
        const body = { ...payload, idempotencyKey };

        try {
          // Idempotency lives in the JSON body so browsers never need a
          // cross-origin preflight just for the Idempotency-Key header.
          await api.post("/contact-requests", body);
          pendingIntentKeys.delete(intent);
          trackEvent("contact_request", {
            teacher_id: payload.teacherId,
            study_mode: payload.studyMode,
          });
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }

        try {
          await get().fetch();
        } catch (fetchErr) {
          console.warn("[CONTACT STORE] background refresh error:", fetchErr);
        } finally {
          set({ isLoading: false });
        }
      },

      createRequestAsTeacher: async (payload) => {
        set({ isLoading: true, error: null });
        const { intent, key: generatedKey } = keyForIntent("cr_t", payload);
        const idempotencyKey = payload.idempotencyKey || generatedKey;
        const body = { ...payload, idempotencyKey };

        try {
          await api.post("/contact-requests/teacher", body);
          pendingIntentKeys.delete(intent);
        } catch (err) {
          set({ error: extractError(err), isLoading: false });
          throw err;
        }

        try {
          await get().fetchIncoming();
        } catch (fetchErr) {
          console.warn("[CONTACT STORE] background refresh error:", fetchErr);
        } finally {
          set({ isLoading: false });
        }
      },

      updateStatus: async (id, status, replyMessage) => {
        try {
          const res = await api.patch<{ data: ContactRequest }>(`/contact-requests/${id}/status`, { status, replyMessage });
          const updated = res.data?.data;
          set((s) => ({
            incoming:
              s.incoming?.map((r) =>
                r.id === id ? { ...r, ...updated, status, replyMessage: replyMessage !== undefined ? replyMessage : r.replyMessage } : r
              ) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
          throw err;
        }
      },

      updateParentStatus: async (id, status, replyMessage) => {
        try {
          const res = await api.patch<{ data: ContactRequest }>(`/contact-requests/parent/${id}/status`, { status, replyMessage });
          const updated = res.data?.data;
          set((s) => ({
            sent:
              s.sent?.map((r) =>
                r.id === id ? { ...r, ...updated, status, replyMessage: replyMessage !== undefined ? replyMessage : r.replyMessage } : r
              ) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
          throw err;
        }
      },

      updateParentMessage: async (id, message) => {
        try {
          const res = await api.patch<{ data: ContactRequest }>(`/contact-requests/${id}`, { message });
          const updated = res.data?.data;
          set((s) => ({
            sent:
              s.sent?.map((r) =>
                r.id === id ? { ...r, ...updated, message } : r
              ) ?? null,
          }));
        } catch (err) {
          set({ error: extractError(err) });
          throw err;
        }
      },

      reset: () => set({ sent: null, incoming: null, isLoading: false, error: null }),
      });
    },
    { name: "contact-requests-store" }
  )
);
