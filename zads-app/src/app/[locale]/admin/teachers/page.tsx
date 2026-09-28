"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import api from "@/lib/api";
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
  AlertCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { extractError } from "@/lib/utils";

export default function AdminTeachersPage() {
  const t = useTranslations("admin");
  const tTeacher = useTranslations("teacher");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const {
    teachers,
    totalTeachers,
    teachersPage,
    teachersTotalPages,
    isLoading,
    error,
    fetchTeachers,
    toggleTeacherVerification,
    updateUserStatus,
    updateUser,
    deleteUser,
  } = useAdminStore();

  const [togglingVerify, setTogglingVerify] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verificationFilter, setVerificationFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleViewCertificate = async (certificateUrl: string) => {
    const preview = window.open("about:blank", "_blank");
    if (!preview) {
      toast.error(locale === "ar" ? "يرجى السماح بالنوافذ المنبثقة لعرض المستند" : "Allow pop-ups to view this document");
      return;
    }
    try {
      const filename = new URL(certificateUrl, window.location.origin).pathname.split("/").pop();
      if (!filename || filename.includes("\\")) throw new Error("Invalid certificate path");
      const res = await api.get(`/upload/certificates/${encodeURIComponent(decodeURIComponent(filename))}`, {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(res.data);
      preview.location.replace(blobUrl);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      preview.close();
      toast.error(locale === "ar" ? "تعذر فتح المستند" : "Unable to open document");
    }
  };

  const loadTeachers = useCallback(
    (page = currentPage, query = search, status = statusFilter, isVerified = verificationFilter) => {
      fetchTeachers({
        page,
        limit: 20,
        search: query || undefined,
        status: status || undefined,
        isVerified: isVerified !== "" ? isVerified === "true" : undefined,
      });
    },
    [fetchTeachers, currentPage, search, statusFilter, verificationFilter]
  );

  useEffect(() => {
    loadTeachers(currentPage, search, statusFilter, verificationFilter);
  }, [currentPage, statusFilter, verificationFilter, loadTeachers]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    loadTeachers(1, val, statusFilter, verificationFilter);
  };

  const handleToggleVerification = async (teacherId: string, currentStatus: boolean) => {
    setTogglingVerify(teacherId);
    try {
      await toggleTeacherVerification(teacherId, !currentStatus);
      toast.success(
        locale === "ar" ? "تم تحديث حالة توثيق المدرس بنجاح" : "Teacher verification status updated successfully"
      );
    } catch {
      toast.error(locale === "ar" ? "فشل تحديث حالة التوثيق" : "Failed to update verification status");
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
      toast.error(locale === "ar" ? "فشل تعديل حالة الحساب" : "Failed to update account status");
    } finally {
      setTogglingStatus(null);
    }
  };

  const openEdit = (teacher: AdminTeacher) => {
    if (!teacher.user) return;
    setEditingTeacher(teacher);
    setEditForm({
      name: teacher.user.name || "",
      phone: teacher.user.phone || "",
      email: teacher.user.email || "",
      password: "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher?.user) return;
    setIsSaving(true);
    try {
      await updateUser(editingTeacher.user.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || null,
        ...(editForm.password.trim() ? { password: editForm.password.trim() } : {}),
      });
      toast.success(locale === "ar" ? "تم تحديث بيانات المدرس" : "Teacher updated successfully");
      setEditingTeacher(null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (teacher: AdminTeacher) => {
    if (!teacher.user) return;
    const ok = window.confirm(t("confirmDeleteUser"));
    if (!ok) return;
    setDeletingId(teacher.user.id);
    try {
      await deleteUser(teacher.user.id);
      toast.success(locale === "ar" ? "تم حذف حساب المدرس" : "Teacher account deleted");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminTeacher>[]>(
    () => [
      {
        accessorFn: (r) => r.user?.name,
        header: t("name"),
        id: "name",
        cell: ({ row }) => (
          <div className="font-bold text-slate-800 text-sm text-start">{row.original.user?.name}</div>
        ),
      },
      {
        accessorFn: (r) => r.user?.phone,
        header: t("phone"),
        id: "phone",
        cell: ({ row }) => (
          <div className="text-xs font-semibold text-slate-500 text-start ltr">{row.original.user?.phone}</div>
        ),
      },
      {
        accessorKey: "viewsCount",
        header: tTeacher("stats.views"),
        cell: ({ getValue }) => (
          <div className="text-xs font-bold text-slate-600 text-start">{getValue() as number}</div>
        ),
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
              <button
                type="button"
                onClick={() => handleViewCertificate(url)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 border border-orange-100 hover:border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-600 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>{isPdf ? "PDF" : locale === "ar" ? "صورة" : "Image"}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </button>
            </div>
          );
        },
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
                    ? locale === "ar"
                      ? "حساب موثق"
                      : "Verified"
                    : locale === "ar"
                      ? "غير موثق"
                      : "Unverified"}
                </span>
              </button>
            </div>
          );
        },
      },
      {
        id: "status",
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
                    ? locale === "ar"
                      ? "تفعيل المدرس"
                      : "Activate"
                    : locale === "ar"
                      ? "إيقاف المدرس"
                      : "Suspend"}
                </span>
              </button>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: t("actions"),
        cell: ({ row }) => {
          const teacher = row.original;
          const userId = teacher.user?.id;
          const isDeleting = !!userId && deletingId === userId;

          return (
            <div className="flex items-center justify-start gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(teacher)}
                title={tCommon("edit")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(teacher)}
                disabled={isDeleting}
                title={tCommon("delete")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        },
      },
    ],
    [t, tTeacher, tCommon, locale, togglingVerify, togglingStatus, deletingId]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-start">
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

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{locale === "ar" ? "كل حالات التوثيق" : "All Verification"}</option>
            <option value="true">{locale === "ar" ? "موثق فقط" : "Verified Only"}</option>
            <option value="false">{locale === "ar" ? "غير موثق" : "Unverified Only"}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{locale === "ar" ? "كل الحسابات" : "All Accounts"}</option>
            <option value="active">{locale === "ar" ? "نشط" : "Active"}</option>
            <option value="suspended">{locale === "ar" ? "موقوف" : "Suspended"}</option>
          </select>
        </div>
      </div>

      <ErrorBanner error={error} onRetry={() => loadTeachers(currentPage, search, statusFilter, verificationFilter)} />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <DataTable
          data={teachers}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder={t("searchTeacher")}
          manualPagination={true}
          page={teachersPage}
          totalPages={teachersTotalPages}
          totalRows={totalTeachers}
          searchValue={search}
          onSearchChange={handleSearchChange}
          onPageChange={(p) => setCurrentPage(p)}
          onRefresh={() => loadTeachers(currentPage, search, statusFilter, verificationFilter)}
          refreshLabel={t("refresh")}
        />
      </div>

      {editingTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => !isSaving && setEditingTeacher(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">{t("editUser")}</h2>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                disabled={isSaving}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("name")}</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("phone")}</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  dir="ltr"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("email")}</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">{t("newPasswordOptional")}</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={6}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {isSaving ? tCommon("loading") : tCommon("save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm hover:bg-muted"
                >
                  {tCommon("cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
