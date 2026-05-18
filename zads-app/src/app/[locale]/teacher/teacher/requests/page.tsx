"use client";

import { useEffect } from "react";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

export default function TeacherRequestsPage() {
  const { incoming, isLoading, error, fetchIncoming, updateStatus } = useContactRequestsStore();

  useEffect(() => {
    fetchIncoming();
  }, [fetchIncoming]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">طلبات التواصل</h1>
      <ErrorBanner error={error} onRetry={fetchIncoming} />

      {isLoading ? (
        <PageSkeleton rows={4} />
      ) : !incoming || incoming.length === 0 ? (
        <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">لا توجد طلبات تواصل.</p>
      ) : (
        <div className="space-y-3">
          {incoming.map((request) => (
            <div key={request.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{request.parent?.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[request.subject?.nameAr, request.stage?.nameAr].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{request.status}</span>
              </div>
              {request.message && <p className="mt-3 text-sm text-muted-foreground">{request.message}</p>}
              {request.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => updateStatus(request.id, "accepted")} className="rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-white">قبول</button>
                  <button onClick={() => updateStatus(request.id, "rejected")} className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive">رفض</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
