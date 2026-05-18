"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit2 } from "lucide-react";
import { useTeacherSubjectsStore } from "@/stores/teacher-subjects";
import { useSearchStore } from "@/stores/search";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { formatPrice } from "@/lib/utils";

export default function TeacherSubjectsPage() {
  const t = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const subjectStore = useTeacherSubjectsStore();
  const { subjects, stages, fetchSubjects, fetchStages } = useSearchStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ subjectId: "", stageId: "", priceOnline: "", priceOffline: "", priceAtTeacher: "", priceAtStudent: "", durationMinutes: "60" });

  useEffect(() => {
    subjectStore.fetch();
    fetchSubjects();
    fetchStages();
  }, []);

  const handleSave = async () => {
    const payload = {
      subjectId: form.subjectId,
      stageId: form.stageId,
      priceOnline: form.priceOnline ? Number(form.priceOnline) : undefined,
      priceOffline: form.priceOffline ? Number(form.priceOffline) : undefined,
      priceAtTeacher: form.priceAtTeacher ? Number(form.priceAtTeacher) : undefined,
      priceAtStudent: form.priceAtStudent ? Number(form.priceAtStudent) : undefined,
      durationMinutes: Number(form.durationMinutes) || 60,
    };
    if (editingId) {
      await subjectStore.updateSubject(editingId, payload);
    } else {
      await subjectStore.addSubject(payload);
    }
    setShowDialog(false);
  };

  if (subjectStore.isLoading && !subjectStore.data) return <PageSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("subjects")}</h1>
        <button
          onClick={() => { setEditingId(null); setForm({ subjectId: "", stageId: "", priceOnline: "", priceOffline: "", priceAtTeacher: "", priceAtStudent: "", durationMinutes: "60" }); setShowDialog(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addSubject")}
        </button>
      </div>

      <ErrorBanner error={subjectStore.error} onRetry={subjectStore.fetch} />

      {(!subjectStore.data || subjectStore.data.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">لا توجد مواد مضافة بعد</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">المادة</th>
                <th className="px-4 py-3 text-start font-medium">المرحلة</th>
                <th className="px-4 py-3 text-start font-medium">{t("priceOnline")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("priceOffline")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {subjectStore.data.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{s.subject?.nameAr}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.stage?.nameAr}</td>
                  <td className="px-4 py-3">{formatPrice(s.priceOnline)}</td>
                  <td className="px-4 py-3">{formatPrice(s.priceOffline)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditingId(s.id); setForm({ subjectId: s.subjectId, stageId: s.stageId, priceOnline: String(s.priceOnline ?? ""), priceOffline: String(s.priceOffline ?? ""), priceAtTeacher: String(s.priceAtTeacher ?? ""), priceAtStudent: String(s.priceAtStudent ?? ""), durationMinutes: String(s.durationMinutes) }); setShowDialog(true); }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-surface p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-semibold">{editingId ? t("editSubject") : t("addSubject")}</h2>
            <div className="space-y-3">
              <select value={form.subjectId} onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
                <option value="">اختر المادة</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
              <select value={form.stageId} onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none">
                <option value="">اختر المرحلة</option>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">{t("priceOnline")}</label>
                  <input type="number" value={form.priceOnline} onChange={(e) => setForm((f) => ({ ...f, priceOnline: e.target.value }))} placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">{t("priceOffline")}</label>
                  <input type="number" value={form.priceOffline} onChange={(e) => setForm((f) => ({ ...f, priceOffline: e.target.value }))} placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">{t("priceAtTeacher")}</label>
                  <input type="number" value={form.priceAtTeacher} onChange={(e) => setForm((f) => ({ ...f, priceAtTeacher: e.target.value }))} placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">{t("priceAtStudent")}</label>
                  <input type="number" value={form.priceAtStudent} onChange={(e) => setForm((f) => ({ ...f, priceAtStudent: e.target.value }))} placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">مدة الجلسة (دقيقة)</label>
                <input type="number" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={handleSave} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
                {tCommon("save")}
              </button>
              <button onClick={() => setShowDialog(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm hover:bg-muted">
                {tCommon("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
