"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useTutorRequestsStore } from "@/stores/tutor-requests";
import { useContactRequestsStore } from "@/stores/contact-requests";
import { useDependentsStore } from "@/stores/dependents";
import { useSearchStore } from "@/stores/search";
import { TutorRequestCard } from "@/components/shared/TutorRequestCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { RequestTarget, StudyMode } from "@/types";

export default function RequestsPage() {
  const t = useTranslations("request");
  const [activeTab, setActiveTab] = useState<"tutor" | "contact">("tutor");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ subjectId: "", stageId: "", requestTarget: "self" as RequestTarget, studyMode: "both" as StudyMode, parentChildId: "", description: "" });

  const tutorStore = useTutorRequestsStore();
  const contactStore = useContactRequestsStore();
  const { data: dependents, fetch: fetchDependents } = useDependentsStore();
  const { subjects, stages, fetchSubjects, fetchStages } = useSearchStore();

  useEffect(() => {
    tutorStore.fetch();
    contactStore.fetch();
    fetchDependents();
    fetchSubjects();
    fetchStages();
  }, []);

  const handleCreateRequest = async () => {
    await tutorStore.createRequest({
      subjectId: form.subjectId,
      stageId: form.stageId,
      requestTarget: form.requestTarget,
      studyMode: form.studyMode,
      parentChildId: form.requestTarget === "dependent" ? form.parentChildId : undefined,
      description: form.description || undefined,
    });
    setShowCreate(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">طلباتي</h1>
        {activeTab === "tutor" && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            طلب جديد
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
        {(["tutor", "contact"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-white" : "hover:bg-muted"}`}
          >
            {tab === "tutor" ? t("tutorRequest") : t("contactRequest")}
          </button>
        ))}
      </div>

      {activeTab === "tutor" ? (
        <>
          <ErrorBanner error={tutorStore.error} onRetry={tutorStore.fetch} />
          {tutorStore.isLoading ? <PageSkeleton /> : (
            <div className="space-y-3">
              {(tutorStore.data ?? []).map((r) => (
                <TutorRequestCard
                  key={r.id}
                  request={r}
                  onClose={tutorStore.closeRequest}
                  onDelete={tutorStore.deleteRequest}
                />
              ))}
              {(tutorStore.data ?? []).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">لا توجد طلبات</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <ErrorBanner error={contactStore.error} onRetry={contactStore.fetch} />
          {contactStore.isLoading ? <PageSkeleton /> : (
            <div className="space-y-3">
              {(contactStore.sent ?? []).map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.teacher?.user.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.status === "accepted" ? "bg-success/10 text-success" : r.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {r.status === "accepted" ? "مقبول" : r.status === "rejected" ? "مرفوض" : "انتظار"}
                    </span>
                  </div>
                  {r.message && <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>}
                </div>
              ))}
              {(contactStore.sent ?? []).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">لا توجد طلبات تواصل</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Create tutor request dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-surface p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-semibold">طلب معلم جديد</h2>
            <div className="space-y-3">
              <select value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
                <option value="">اختر المادة</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
              <select value={form.stageId} onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
                <option value="">اختر المرحلة</option>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
                {(["self", "dependent"] as const).map((target) => (
                  <button key={target} type="button" onClick={() => setForm((f) => ({ ...f, requestTarget: target }))} className={`py-2.5 text-sm font-medium ${form.requestTarget === target ? "bg-primary text-white" : "hover:bg-muted"}`}>
                    {target === "self" ? "لنفسي" : "لتابعي"}
                  </button>
                ))}
              </div>
              {form.requestTarget === "dependent" && dependents && dependents.length > 0 && (
                <select value={form.parentChildId} onChange={(e) => setForm((f) => ({ ...f, parentChildId: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
                  <option value="">اختر التابع</option>
                  {dependents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border">
                {(["online", "offline", "both"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setForm((f) => ({ ...f, studyMode: mode }))} className={`py-2 text-xs font-medium ${form.studyMode === mode ? "bg-primary text-white" : "hover:bg-muted"}`}>
                    {mode === "online" ? "أونلاين" : mode === "offline" ? "أوفلاين" : "كلاهما"}
                  </button>
                ))}
              </div>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="وصف الطلب (اختياري)" rows={2} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={handleCreateRequest} disabled={!form.subjectId || !form.stageId} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60">
                إرسال الطلب
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm hover:bg-muted">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
