"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import type { Subject } from "@/types";
import { useAdminStore } from "@/stores/admin";
import { 
  BookOpen, 
  Plus, 
  Pencil, 
  CheckCircle2, 
  XCircle, 
  X,
  Loader2,
  ListOrdered
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSubjectsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { 
    subjects, 
    isLoading, 
    error, 
    fetchSubjects, 
    createSubject, 
    updateSubject 
  } = useAdminStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    icon: "",
    sortOrder: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setForm({ nameAr: "", nameEn: "", icon: "", sortOrder: subjects.length + 1 });
    setDialogOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({ 
      nameAr: subject.nameAr, 
      nameEn: subject.nameEn || "", 
      icon: subject.icon || "",
      sortOrder: subject.sortOrder 
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr.trim()) {
      toast.error(locale === "ar" ? "الاسم العربي مطلوب" : "Arabic name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, form);
        toast.success(locale === "ar" ? "تم تعديل المادة بنجاح" : "Subject updated successfully");
      } else {
        await createSubject(form);
        toast.success(locale === "ar" ? "تم إنشاء المادة بنجاح" : "Subject created successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error(locale === "ar" ? "فشل حفظ البيانات" : "Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (subject: Subject) => {
    setTogglingId(subject.id);
    const newStatus = !subject.isActive;
    try {
      await updateSubject(subject.id, { isActive: newStatus });
      toast.success(
        locale === "ar"
          ? `تم ${newStatus ? "تفعيل" : "تعطيل"} المادة الدراسية بنجاح`
          : `Subject ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch {
      toast.error(
        locale === "ar" ? "فشل تعديل حالة النشاط" : "Failed to toggle status"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Subject>[]>(() => [
    { 
      accessorKey: "nameAr", 
      header: t("arabicName"),
      cell: ({ getValue }) => (
        <div className="font-bold text-slate-800 text-sm text-start">
          {getValue() as string}
        </div>
      )
    },
    { 
      accessorKey: "nameEn", 
      header: t("englishName"),
      cell: ({ getValue }) => (
        <div className="text-xs font-semibold text-slate-500 text-start">
          {getValue() as string || <span className="text-slate-300">-</span>}
        </div>
      )
    },
    { 
      accessorKey: "icon", 
      header: locale === "ar" ? "أيقونة المادة" : "Icon",
      cell: ({ getValue }) => (
        <div className="text-xs font-semibold text-slate-600 text-start font-mono">
          {getValue() as string || <span className="text-slate-300">-</span>}
        </div>
      )
    },
    { 
      accessorKey: "sortOrder", 
      header: t("order"),
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-xs font-bold text-slate-600 text-start">
          <ListOrdered className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{getValue() as number}</span>
        </div>
      )
    },
    {
      accessorKey: "isActive",
      header: t("status"),
      cell: ({ row, getValue }) => {
        const val = getValue() as boolean;
        const id = row.original.id;
        const isPending = togglingId === id;

        return (
          <div className="flex justify-start">
            <button
              onClick={() => handleToggleActive(row.original)}
              disabled={isPending}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold border transition-all ${
                val
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              ) : val ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              <span>{val ? (locale === "ar" ? "نشط" : "Active") : (locale === "ar" ? "معطل" : "Inactive")}</span>
            </button>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: locale === "ar" ? "العمليات" : "Actions",
      cell: ({ row }) => (
        <div className="flex justify-start gap-1.5">
          <button
            onClick={() => handleOpenEdit(row.original)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
            title={locale === "ar" ? "تعديل" : "Edit"}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ], [t, locale, togglingId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-start">
      {/* Header Panel */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>{t("subjects")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "ar" 
              ? "أضف أو عدل المواد الدراسية المختلفة (اللغة العربية، الرياضيات، العلوم) المتاحة للربط بين المدرسين والعملاء." 
              : "Manage educational curriculum subjects (Arabic, Mathematics, Science) inside the system."}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/10 select-none cursor-pointer text-center justify-center shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{locale === "ar" ? "إضافة مادة جديدة" : "Add New Subject"}</span>
        </button>
      </div>

      <ErrorBanner error={error} />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <DataTable
          data={subjects}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder={t("searchSubject")}
        />
      </div>

      {/* Dynamic Pop-up Modal Form */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 w-full max-w-md shadow-2xl scale-in duration-300 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-800 text-base">
                {editingSubject 
                  ? (locale === "ar" ? "تعديل المادة الدراسية" : "Edit Subject") 
                  : (locale === "ar" ? "إضافة مادة دراسية جديدة" : "Add New Subject")}
              </h3>
              <button 
                onClick={() => setDialogOpen(false)} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  {locale === "ar" ? "الاسم باللغة العربية *" : "Arabic Name *"}
                </label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                  required
                  placeholder={locale === "ar" ? "مثال: الرياضيات" : "e.g. Mathematics"}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  {locale === "ar" ? "الاسم باللغة الإنجليزية" : "English Name"}
                </label>
                <input
                  type="text"
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  placeholder={locale === "ar" ? "مثال: Mathematics" : "e.g. Mathematics"}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  {locale === "ar" ? "أيقونة المادة (اختياري)" : "Icon Name (Optional)"}
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  placeholder="e.g. BookOpen"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  {locale === "ar" ? "الترتيب *" : "Sort Order *"}
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/10 disabled:opacity-60 flex items-center gap-1"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{tCommon("save")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
