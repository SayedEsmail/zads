"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Edit2, Clock, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTeacherSubjectsStore } from "@/stores/teacher-subjects";
import { useSearchStore } from "@/stores/search";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { formatPrice } from "@/lib/utils";

export default function TeacherSubjectsPage() {
  const locale = useLocale();
  const t = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const tRequest = useTranslations("request");
  const subjectStore = useTeacherSubjectsStore();
  const { subjects, stages, fetchSubjects, fetchStages } = useSearchStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPrices, setShowPrices] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [form, setForm] = useState({ subjectId: "", stageId: "", priceOnline: "", priceOffline: "", priceAtTeacher: "", priceAtStudent: "", isOnline: false, isOffline: true, durationMinutes: "60" });

  useEffect(() => {
    subjectStore.fetch();
    fetchSubjects();
    fetchStages();
  }, []);

  const handleSave = async () => {
    if (!form.subjectId || !form.stageId) {
      setDialogError(locale === "ar" ? "يرجى اختيار المادة والمرحلة الدراسية" : "Please select subject and stage");
      return;
    }
    if (!form.isOnline && !form.isOffline) {
      setDialogError(locale === "ar" ? "يرجى اختيار طريقة تدريس واحدة على الأقل" : "Select at least one teaching mode");
      return;
    }

    // Check for duplicate subject and stage combination
    const isDuplicate = subjectStore.data?.some(
      (s) => s.id !== editingId && s.subjectId === form.subjectId && s.stageId === form.stageId
    );

    if (isDuplicate) {
      setDialogError(
        locale === "ar"
          ? "هذه المادة مضافة بالفعل لنفس المرحلة الدراسية"
          : "This subject is already added for this stage"
      );
      return;
    }

    setDialogError(null);
    setIsSaving(true);

    try {
      const payload = {
        subjectId: form.subjectId,
        stageId: form.stageId,
        priceOnline: showPrices && form.priceOnline ? Number(form.priceOnline) : null,
        priceOffline: showPrices && form.priceOffline ? Number(form.priceOffline) : null,
        priceAtTeacher: showPrices && form.priceAtTeacher ? Number(form.priceAtTeacher) : null,
        priceAtStudent: showPrices && form.priceAtStudent ? Number(form.priceAtStudent) : null,
        isOnline: form.isOnline,
        isOffline: form.isOffline,
        durationMinutes: Number(form.durationMinutes) || 60,
      };

      if (editingId) {
        await subjectStore.updateSubject(editingId, payload);
        toast.success(locale === "ar" ? "تم تحديث المادة بنجاح" : "Subject updated successfully");
      } else {
        await subjectStore.addSubject(payload);
        toast.success(locale === "ar" ? "تمت إضافة المادة بنجاح" : "Subject added successfully");
      }
      setShowDialog(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setDialogError(axiosErr.response?.data?.message ?? axiosErr.message ?? (locale === "ar" ? "حدث خطأ أثناء حفظ المادة" : "Error saving subject"));
    } finally {
      setIsSaving(false);
    }
  };

  if (subjectStore.isLoading && !subjectStore.data) return <PageSkeleton />;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("subjects")}</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ subjectId: "", stageId: "", priceOnline: "", priceOffline: "", priceAtTeacher: "", priceAtStudent: "", isOnline: false, isOffline: true, durationMinutes: "60" });
            setShowPrices(false);
            setShowDialog(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/10 active:scale-95 transition-all duration-150"
        >
          <Plus className="h-4.5 w-4.5" />
          {t("addSubject")}
        </button>
      </div>

      <ErrorBanner error={subjectStore.error} onRetry={subjectStore.fetch} />

      {(!subjectStore.data || subjectStore.data.length === 0) ? (
        <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookOpen className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-muted-foreground font-medium">{t("noSubjectsYet")}</p>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ subjectId: "", stageId: "", priceOnline: "", priceOffline: "", priceAtTeacher: "", priceAtStudent: "", isOnline: false, isOffline: true, durationMinutes: "60" });
              setShowPrices(false);
              setShowDialog(true);
            }}
            className="mt-4 text-sm font-bold text-primary hover:text-blue-700 hover:underline"
          >
            {t("addSubject")}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjectStore.data.map((s) => (
            <div
              key={s.id}
              className="group rounded-[1.25rem] bg-white border border-slate-100 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 text-start">
                    <h3 className="font-bold text-slate-900 text-base">{s.subject?.nameAr}</h3>
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {s.stage?.nameAr}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setEditingId(s.id);
                      setForm({
                        subjectId: s.subjectId,
                        stageId: s.stageId,
                        priceOnline: String(s.priceOnline ?? ""),
                        priceOffline: String(s.priceOffline ?? ""),
                        priceAtTeacher: String(s.priceAtTeacher ?? ""),
                        priceAtStudent: String(s.priceAtStudent ?? ""),
                        isOnline: s.isOnline ?? s.priceOnline != null,
                        isOffline: s.isOffline ?? (s.priceOffline != null || s.priceAtTeacher != null || s.priceAtStudent != null),
                        durationMinutes: String(s.durationMinutes)
                      });
                      setShowPrices(!!(s.priceOnline || s.priceOffline || s.priceAtTeacher || s.priceAtStudent));
                      setShowDialog(true);
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-muted-foreground hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-150"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Pricing Details */}
                {(s.priceOnline || s.priceOffline || s.priceAtTeacher || s.priceAtStudent) ? (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {s.priceOnline !== null && s.priceOnline !== undefined && Number(s.priceOnline) > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-start">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 text-[10px]">🌐</span>
                        <span className="truncate">
                          {locale === "ar" ? "أونلاين: " : "Online: "}
                          <strong className="text-foreground font-bold">{formatPrice(s.priceOnline)}</strong>
                        </span>
                      </div>
                    )}
                    {s.priceOffline !== null && s.priceOffline !== undefined && Number(s.priceOffline) > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-start">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500 text-[10px]">📍</span>
                        <span className="truncate">
                          {locale === "ar" ? "حضورياً: " : "Offline: "}
                          <strong className="text-foreground font-bold">{formatPrice(s.priceOffline)}</strong>
                        </span>
                      </div>
                    )}
                    {s.priceAtTeacher !== null && s.priceAtTeacher !== undefined && Number(s.priceAtTeacher) > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-start">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 text-[10px]">🏠</span>
                        <span className="truncate">
                          {locale === "ar" ? "عند المعلم: " : "At Teacher: "}
                          <strong className="text-foreground font-bold">{formatPrice(s.priceAtTeacher)}</strong>
                        </span>
                      </div>
                    )}
                    {s.priceAtStudent !== null && s.priceAtStudent !== undefined && Number(s.priceAtStudent) > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-start">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 text-[10px]">🚗</span>
                        <span className="truncate">
                          {locale === "ar" ? "عند الطالب: " : "At Student: "}
                          <strong className="text-foreground font-bold">{formatPrice(s.priceAtStudent)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50/50 p-2 rounded-xl border border-amber-100/30 text-start">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px]">💬</span>
                    <span>{locale === "ar" ? "السعر حسب الاتفاق" : "Price Negotiable"}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1 text-start">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {locale === "ar" ? `مدة الجلسة: ${s.durationMinutes} دقيقة` : `Session: ${s.durationMinutes} mins`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center animate-in fade-in duration-200" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-bold text-lg text-slate-800 text-start">{editingId ? t("editSubject") : t("addSubject")}</h2>
            
            {dialogError && (
              <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive flex items-center gap-2 text-start">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dialogError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Subject Select */}
              <div className="text-start">
                <label className="mb-1 block text-xs font-semibold text-slate-600">{tCommon("subject")}</label>
                <select 
                  value={form.subjectId} 
                  onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))} 
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">{tRequest("selectSubject")}</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>

              {/* Stage Select */}
              <div className="text-start">
                <label className="mb-1 block text-xs font-semibold text-slate-600">{tCommon("stage")}</label>
                <select 
                  value={form.stageId} 
                  onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))} 
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">{tRequest("selectStage")}</option>
                  {stages.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>

              {/* Duration Input */}
              <div className="text-start">
                <label className="mb-1 block text-xs font-semibold text-slate-600">{t("durationMinutes")}</label>
                <input 
                  type="number" 
                  value={form.durationMinutes} 
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} 
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                />
              </div>

              <fieldset className="space-y-2 text-start">
                <legend className="text-xs font-semibold text-slate-600">
                  {locale === "ar" ? "طرق التدريس المتاحة" : "Available teaching modes"}
                </legend>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isOnline}
                      onChange={(e) => setForm((f) => ({ ...f, isOnline: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                    {locale === "ar" ? "أونلاين" : "Online"}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isOffline}
                      onChange={(e) => setForm((f) => ({ ...f, isOffline: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                    {locale === "ar" ? "حضوري" : "In person"}
                  </label>
                </div>
              </fieldset>

              {/* Specify Prices Checkbox */}
              <div className="flex items-center gap-2.5 py-1 text-start">
                <input
                  type="checkbox"
                  id="specify-prices"
                  checked={showPrices}
                  onChange={(e) => setShowPrices(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <label htmlFor="specify-prices" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  {locale === "ar" ? "تحديد أسعار الحصص للمادة" : "Specify session rates for this subject"}
                </label>
              </div>

              {/* Pricing Grid */}
              {showPrices && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="text-start">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t("priceOnline")}</label>
                    <input 
                      type="number" 
                      value={form.priceOnline} 
                      onChange={(e) => setForm((f) => ({ ...f, priceOnline: e.target.value }))} 
                      placeholder="0" 
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="text-start">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t("priceOffline")}</label>
                    <input 
                      type="number" 
                      value={form.priceOffline} 
                      onChange={(e) => setForm((f) => ({ ...f, priceOffline: e.target.value }))} 
                      placeholder="0" 
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="text-start">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t("priceAtTeacher")}</label>
                    <input 
                      type="number" 
                      value={form.priceAtTeacher} 
                      onChange={(e) => setForm((f) => ({ ...f, priceAtTeacher: e.target.value }))} 
                      placeholder="0" 
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                  <div className="text-start">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t("priceAtStudent")}</label>
                    <input 
                      type="number" 
                      value={form.priceAtStudent} 
                      onChange={(e) => setForm((f) => ({ ...f, priceAtStudent: e.target.value }))} 
                      placeholder="0" 
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/10 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
              >
                {isSaving ? (locale === "ar" ? "جاري الحفظ..." : "Saving...") : tCommon("save")}
              </button>
              <button 
                onClick={() => setShowDialog(false)} 
                disabled={isSaving}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
              >
                {tCommon("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
