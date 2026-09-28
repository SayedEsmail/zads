"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  Mail,
  Smartphone,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminParent } from "@/types";
import { extractError } from "@/lib/utils";

export default function AdminParentsPage() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const {
    parents,
    totalParents,
    parentsPage,
    parentsTotalPages,
    isLoading,
    error,
    fetchParents,
    updateUserStatus,
    updateUser,
    deleteUser,
  } = useAdminStore();

  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingParent, setEditingParent] = useState<AdminParent | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [isSaving, setIsSaving] = useState(false);

  const loadParents = useCallback(
    (page = currentPage, query = search) => {
      fetchParents({
        page,
        limit: 20,
        search: query || undefined,
      });
    },
    [fetchParents, currentPage, search]
  );

  useEffect(() => {
    loadParents(currentPage, search);
  }, [currentPage, loadParents]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    loadParents(1, val);
  };

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
      toast.error(locale === "ar" ? "فشل تعديل حالة الحساب" : "Failed to update account status");
    } finally {
      setTogglingStatus(null);
    }
  };

  const openEdit = (parent: AdminParent) => {
    if (!parent.user) return;
    setEditingParent(parent);
    setEditForm({
      name: parent.user.name || "",
      phone: parent.user.phone || "",
      email: parent.user.email || "",
      password: "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParent?.user) return;
    setIsSaving(true);
    try {
      await updateUser(editingParent.user.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || null,
        ...(editForm.password.trim() ? { password: editForm.password.trim() } : {}),
      });
      toast.success(locale === "ar" ? "تم تحديث بيانات العميل" : "Client updated successfully");
      setEditingParent(null);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (parent: AdminParent) => {
    if (!parent.user) return;
    const ok = window.confirm(t("confirmDeleteUser"));
    if (!ok) return;
    setDeletingId(parent.user.id);
    try {
      await deleteUser(parent.user.id);
      toast.success(locale === "ar" ? "تم حذف حساب العميل" : "Client account deleted");
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<AdminParent>[]>(
    () => [
      {
        accessorFn: (row) => row.user?.name,
        header: t("name"),
        id: "name",
        cell: ({ row }) => (
          <div className="font-bold text-slate-800 text-sm text-start">{row.original.user?.name}</div>
        ),
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
        ),
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
        ),
      },
      {
        accessorKey: "clientAccountKind",
        header: tAuth("accountKind"),
        cell: ({ getValue }) => {
          const val = getValue() as string;
          const isGuardian = val === "guardian";
          return (
            <div className="flex justify-start">
              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                  isGuardian
                    ? "bg-blue-50 border-blue-100 text-blue-700"
                    : "bg-indigo-50 border-indigo-100 text-indigo-700"
                }`}
              >
                {isGuardian
                  ? locale === "ar"
                    ? "ولي أمر"
                    : "Guardian"
                  : locale === "ar"
                    ? "طالب"
                    : "Student"}
              </span>
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
                      ? "تفعيل العميل"
                      : "Activate"
                    : locale === "ar"
                      ? "إيقاف العميل"
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
          const parent = row.original;
          const userId = parent.user?.id;
          const isDeleting = !!userId && deletingId === userId;

          return (
            <div className="flex items-center justify-start gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(parent)}
                title={tCommon("edit")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(parent)}
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
    [t, tAuth, tCommon, locale, togglingStatus, deletingId]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-start">
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

      <ErrorBanner error={error} onRetry={() => loadParents(currentPage, search)} />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <DataTable
          data={parents}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder={t("searchClient")}
          manualPagination={true}
          page={parentsPage}
          totalPages={parentsTotalPages}
          totalRows={totalParents}
          searchValue={search}
          onSearchChange={handleSearchChange}
          onPageChange={(p) => setCurrentPage(p)}
          onRefresh={() => loadParents(currentPage, search)}
          refreshLabel={t("refresh")}
        />
      </div>

      {editingParent && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => !isSaving && setEditingParent(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">{t("editUser")}</h2>
              <button
                type="button"
                onClick={() => setEditingParent(null)}
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
                  onClick={() => setEditingParent(null)}
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
