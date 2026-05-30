"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { useAdminStore } from "@/stores/admin";
import { 
  Users, 
  UserMinus, 
  UserCheck, 
  Loader2,
  AlertCircle,
  Mail,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import type { AdminParent } from "@/types";

export default function AdminParentsPage() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const locale = useLocale();

  const { 
    parents, 
    isLoading, 
    error, 
    fetchParents, 
    updateUserStatus 
  } = useAdminStore();

  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleToggleUserStatus = async (userId: string, currentStatus: "active" | "suspended") => {
    setTogglingStatus(userId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateUserStatus(userId, newStatus);
      toast.success(
        locale === "ar"
          ? `تم ${newStatus === "suspended" ? "إيقاف" : "تفعيل"} حساب العميل بنجاح`
          : `Client account ${newStatus === "suspended" ? "suspended" : "activated"} successfully`
      );
    } catch {
      toast.error(
        locale === "ar" ? "فشل تعديل حالة الحساب" : "Failed to update account status"
      );
    } finally {
      setTogglingStatus(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminParent>[]>(() => [
    { 
      accessorFn: (row) => row.user?.name, 
      header: t("name"), 
      id: "name",
      cell: ({ row }) => (
        <div className="font-bold text-slate-800 text-sm text-start">
          {row.original.user?.name}
        </div>
      )
    },
    { 
      accessorFn: (row) => row.user?.phone, 
      header: t("phone"), 
      id: "phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 text-start ltr">
          <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{row.original.user?.phone}</span>
        </div>
      )
    },
    { 
      accessorFn: (row) => row.user?.email ?? "-", 
      header: t("email"), 
      id: "email",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs text-slate-500 text-start">
          {row.original.user?.email ? (
            <>
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-[150px]">{row.original.user.email}</span>
            </>
          ) : (
            <span className="text-slate-300">-</span>
          )}
        </div>
      )
    },
    { 
      accessorKey: "clientAccountKind", 
      header: tAuth("accountKind"),
      cell: ({ getValue }) => {
        const val = getValue() as string;
        const isGuardian = val === "guardian";
        return (
          <div className="flex justify-start">
            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${
              isGuardian 
                ? "bg-blue-50 border-blue-100 text-blue-700" 
                : "bg-indigo-50 border-indigo-100 text-indigo-700"
            }`}>
              {isGuardian ? (locale === "ar" ? "ولي أمر" : "Guardian") : (locale === "ar" ? "طالب" : "Student")}
            </span>
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
                  ? (locale === "ar" ? "تفعيل العميل" : "Activate")
                  : (locale === "ar" ? "إيقاف العميل" : "Suspend")}
              </span>
            </button>
          </div>
        );
      }
    }
  ], [t, tAuth, locale, togglingStatus]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-start">
      {/* Header Panel */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>{t("clients")}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {locale === "ar" 
              ? "استعرض قائمة أولياء الأمور والطلاب المسجلين وتحكم في نشاط حساباتهم للتأكد من سلامة المعاملات." 
              : "Browse registered parent and student accounts, and control their active or suspended status."}
          </p>
        </div>
      </div>

      <ErrorBanner error={error} />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <DataTable
          data={parents}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder={t("searchClient")}
        />
      </div>
    </div>
  );
}
