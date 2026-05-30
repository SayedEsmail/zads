"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { AdminTeacher } from "@/types";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { useAdminStore } from "@/stores/admin";
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  ExternalLink, 
  UserMinus, 
  UserCheck, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminTeachersPage() {
  const t = useTranslations("admin");
  const tTeacher = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { 
    teachers, 
    isLoading, 
    error, 
    fetchTeachers, 
    toggleTeacherVerification, 
    updateUserStatus 
  } = useAdminStore();

  const [togglingVerify, setTogglingVerify] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleToggleVerification = async (teacherId: string, currentStatus: boolean) => {
    setTogglingVerify(teacherId);
    try {
      await toggleTeacherVerification(teacherId, !currentStatus);
      toast.success(
        locale === "ar" 
          ? "تم تحديث حالة توثيق المدرس بنجاح" 
          : "Teacher verification status updated successfully"
      );
    } catch {
      toast.error(
        locale === "ar" ? "فشل تحديث حالة التوثيق" : "Failed to update verification status"
      );
    } finally {
      setTogglingVerify(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: "active" | "suspended") => {
    setTogglingStatus(userId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateUserStatus(userId, newStatus);
      toast.success(
        locale === "ar"
          ? `تم ${newStatus === "suspended" ? "إيقاف" : "تفعيل"} حساب المدرس بنجاح`
          : `Teacher account ${newStatus === "suspended" ? "suspended" : "activated"} successfully`
      );
    } catch {
      toast.error(
        locale === "ar" ? "فشل تعديل حالة الحساب" : "Failed to update account status"
      );
    } finally {
      setTogglingStatus(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminTeacher>[]>(() => [
    { 
      accessorFn: (r) => r.user?.name, 
      header: t("name"), 
      id: "name",
      cell: ({ row }) => (
        <div className="font-bold text-slate-800 text-sm text-start">
          {row.original.user?.name}
        </div>
      )
    },
    { 
      accessorFn: (r) => r.user?.phone, 
      header: t("phone"), 
      id: "phone",
      cell: ({ row }) => (
        <div className="text-xs font-semibold text-slate-500 text-start ltr">
          {row.original.user?.phone}
        </div>
      )
    },
    { 
      accessorKey: "viewsCount", 
      header: tTeacher("stats.views"),
      cell: ({ getValue }) => (
        <div className="text-xs font-bold text-slate-600 text-start">
          {getValue() as number}
        </div>
      )
    },
    {
      id: "certificate",
      header: locale === "ar" ? "ملف التوثيق" : "Verification File",
      cell: ({ row }) => {
        const url = row.original.certificateUrl;
        if (!url) {
          return (
            <div className="flex justify-start">
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {locale === "ar" ? "لم يتم الرفع بعد" : "Awaiting Upload"}
              </span>
            </div>
          );
        }

        const isPdf = url.toLowerCase().endsWith(".pdf");

        return (
          <div className="flex justify-start">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-100 hover:border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-600 shadow-sm transition-all hover:scale-[1.02]"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{isPdf ? "PDF" : (locale === "ar" ? "صورة" : "Image")}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        );
      }
    },
    {
      accessorKey: "isVerified",
      header: tCommon("verified"),
      cell: ({ row, getValue }) => {
        const val = getValue() as boolean;
        const id = row.original.id;
        const isPending = togglingVerify === id;

        return (
          <div className="flex justify-start">
            <button
              onClick={() => handleToggleVerification(id, val)}
              disabled={isPending}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                val 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50" 
                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50"
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
              ) : val ? (
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              )}
              <span>
                {val 
                  ? (locale === "ar" ? "حساب موثق" : "Verified") 
                  : (locale === "ar" ? "غير موثق" : "Unverified")}
              </span>
            </button>
          </div>
        );
      }
    },
    {
      id: "actions",
      header: locale === "ar" ? "حالة الحساب" : "Account Status",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return null;
        
        const isSuspended = user.status === "suspended";
        const isPending = togglingStatus === user.id;

        return (
          <div className="flex justify-start">
            <button
              onClick={() => handleToggleUserStatus(user.id, user.status as "active" | "suspended")}
              disabled={isPending}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all border ${
                isSuspended
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              ) : isSuspended ? (
                <UserCheck className="w-3 h-3 shrink-0" />
              ) : (
                <UserMinus className="w-3 h-3 shrink-0" />
              )}
              <span>
                {isSuspended
                  ? (locale === "ar" ? "تفعيل المدرس" : "Activate")
                  : (locale === "ar" ? "إيقاف المدرس" : "Suspend")}
              </span>
            </button>
          </div>
        );
      }
    }
  ], [t, tTeacher, tCommon, locale, togglingVerify, togglingStatus]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-start">
      {/* Header Panel */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>{t("teachers")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "ar" 
              ? "تحقق من شهادات المدرسين ووثق حساباتهم أو أوقف الحسابات المخالفة للضوابط." 
              : "Review uploaded degrees and verification credentials, verify teachers, or suspend accounts."}
          </p>
        </div>
      </div>

      <ErrorBanner error={error} />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <DataTable
          data={teachers}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder={t("searchTeacher")}
        />
      </div>
    </div>
  );
}
